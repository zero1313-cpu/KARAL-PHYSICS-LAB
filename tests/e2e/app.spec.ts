import { expect, test } from '@playwright/test';

async function setRange(page: import('@playwright/test').Page, label: string, value: string): Promise<void> {
  const slider = page.getByRole('slider', { name: label });
  await slider.evaluate((element, next) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(element as HTMLInputElement, next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

test('home loads with navigation, offline-ready status and no layout overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header').first().getByText('KARAL PHYSICS LAB')).toBeVisible();
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByText('Continue learning')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('sidebar navigation changes routes (large screens)', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium', 'Sidebar is hidden on small screens');
  await page.goto('/');
  const sidebar = page.locator('aside');
  for (const [label, hash] of [
    ['Courses', '#/courses'],
    ['Physics Lab', '#/lab'],
    ['Numericals', '#/numericals'],
    ['Formula Book', '#/formulas'],
    ['Practical Experiments', '#/experiments'],
    ['Quizzes', '#/quizzes'],
    ['Bookmarks', '#/bookmarks'],
    ['Progress', '#/progress'],
    ['Settings', '#/settings'],
  ] as const) {
    await sidebar.getByRole('button', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  }
});

test('mobile bottom navigation opens the extended menu (small screens)', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Bottom bar is hidden on large screens');
  await page.goto('/');
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByRole('button', { name: 'Formula Book', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Formula Book', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Formula Book', exact: true })).toBeVisible();
});

test('language switch translates the interface and persists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome back')).toBeVisible();
  await page.getByRole('button', { name: 'Language' }).click();
  await expect(page.getByText('वापसी पर स्वागत है')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await page.reload();
  await expect(page.getByText('वापसी पर स्वागत है')).toBeVisible();
});

test('2D lab controls change parameters, pause and reset', async ({ page }) => {
  await page.goto('/#/sim/ohms-law');
  await expect(page.getByRole('heading', { name: "Ohm's law" })).toBeVisible();
  const current = page.getByText('Current', { exact: true }).locator('..').locator('p').last();
  const before = await current.textContent();
  await setRange(page, 'Voltage', '24');
  await setRange(page, 'Resistance', '4');
  await expect(current).not.toHaveText(before ?? '');
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
});

test('quiz flow answers questions and shows a saved local result', async ({ page }) => {
  await page.goto('/#/quizzes');
  await page.locator('button.panel').first().click();
  await expect(page).toHaveURL(/#\/quiz\//);
  const options = page.locator('button.btn[class*="min-h-"]');
  await options.first().click();
  for (let i = 0; i < 40; i++) {
    const next = page.getByRole('button', { name: 'Next' });
    if (await next.isVisible()) {
      await next.click();
      await options.first().click();
      continue;
    }
    await page.getByRole('button', { name: 'Submit' }).click();
    break;
  }
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Result summary')).toBeVisible();
  await expect(dialog.getByText(/Saved locally/)).toBeVisible();
});

test('service worker keeps the app available offline after a controlled load', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
  await page.reload();
  await expect(page.getByText('Welcome back')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Welcome back')).toBeVisible();
  await context.setOffline(false);
});

test('Android back-button event navigates through app history', async ({ page }) => {
  await page.goto('/#/courses');
  await page.evaluate(() => { window.location.hash = '#/formulas'; });
  await expect(page.getByRole('heading', { name: 'Formula Book', exact: true })).toBeVisible();
  await page.waitForFunction(() => {
    const app = (window as unknown as { Capacitor?: { Plugins?: { App?: Record<string, () => Promise<boolean>> } } }).Capacitor?.Plugins?.App;
    return Boolean(app?.hasListeners);
  }, null, { timeout: 10000 });
  const fireBack = (canGoBack: boolean) => page.evaluate(async (value) => {
    const app = (window as unknown as { Capacitor: { Plugins: { App: { notifyListeners: (name: string, data: unknown) => Promise<void> } } } }).Capacitor.Plugins.App;
    await app.notifyListeners('backButton', { canGoBack: value });
  }, canGoBack);

  await fireBack(true);
  await expect(page).toHaveURL(/#\/courses$/);
  await fireBack(false);
  await expect(page).toHaveURL(/#\/home$/);
});
