import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with hero and footer', async ({ page }) => {
    await page.goto('/');

    // Hero h1
    await expect(page.getByRole('heading', { level: 1 })).toContainText('多模态交互');

    // Logo
    await expect(page.locator('img[alt="双泓科技"]')).toBeVisible();

    // Footer copyright
    await expect(page.getByText(/上海双泓信息科技/)).toBeVisible();

    // 2 CTAs
    await expect(page.getByRole('link', { name: /多模态交互方案/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /智能AI应用解决方案/ })).toBeVisible();
  });

  test('solution cards link to category page', async ({ page }) => {
    await page.goto('/');

    // First solution card should link to /multimodal or /ai-application
    const card = page.getByRole('link', { name: /导览产品/ }).first();
    await expect(card).toHaveAttribute('href', /\/multimodal/);
  });
});

test.describe('Navigation', () => {
  test('header links work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '多模态交互', exact: true }).first().click();
    await expect(page).toHaveURL(/\/multimodal/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('多模态');
  });
});

test.describe('Inquiry form', () => {
  test('submits valid data and shows success', async ({ page }) => {
    await page.goto('/about#contact');

    await page.getByLabel('姓名 *').fill('Playwright Test');
    await page.getByLabel('公司 *').fill('E2E Co');
    await page.getByLabel('邮箱 *').fill('e2e@test.com');
    await page.getByLabel('留言 *').fill('Playwright 自动化测试');

    await page.getByRole('button', { name: /提交询盘/ }).click();

    await expect(page.getByText('提交成功')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('SEO', () => {
  test('sitemap.xml returns valid XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('/multimodal');
    expect(text).toContain('/ai-application');
  });

  test('robots.txt allows / and disallows /api/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /api/');
  });
});
