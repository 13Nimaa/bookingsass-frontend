import { test, expect, type Page } from '@playwright/test';

/**
 * Focused business-module E2E. Most journeys mock the backend so the suite
 * stays deterministic without production credentials. Real-backend paths skip
 * when E2E_TEST_PHONE_NUMBER / E2E_TEST_PASSWORD are unset.
 */

const TEST_PHONE = process.env.E2E_TEST_PHONE_NUMBER ?? '';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? '';

function skipWithoutCreds() {
  test.skip(
    !TEST_PHONE || !TEST_PASSWORD,
    'Set E2E_TEST_PHONE_NUMBER and E2E_TEST_PASSWORD to run live business E2E.',
  );
}

async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(() => {
    const session = {
      user: {
        userId: 'user-e2e',
        name: 'کاربر تست',
        phoneNumber: '09123456789',
      },
      accessToken: 'e2e-access',
      refreshToken: 'e2e-refresh',
      expiresAt: '2099-01-01T00:00:00.000Z',
    };
    window.localStorage.setItem('bf_session', JSON.stringify(session));
  });

  // Keep restoreSession from wiping the seeded tokens: refresh must succeed.
  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          userId: 'user-e2e',
          name: 'کاربر تست',
          phoneNumber: '09123456789',
        },
        accessToken: 'e2e-access',
        refreshToken: 'e2e-refresh',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    });
  });
}

test.describe('business protected routes (no live backend)', () => {
  test('unauthenticated /dashboard/business redirects to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard/business');
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: 'خوش آمدید' }),
    ).toBeVisible();
  });

  test('unauthenticated /register/business redirects to /login', async ({
    page,
  }) => {
    await page.goto('/register/business');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('business registration UI with mocked API', () => {
  test('client validation blocks empty submit on /register/business', async ({
    page,
  }) => {
    await seedAuthenticatedSession(page);
    await page.goto('/register/business');

    await expect(
      page.getByRole('heading', { name: 'اطلاعات آرایشگاه' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'ایجاد کسب‌وکار' }).click();

    await expect(page.getByText('نام کسب‌وکار الزامی است.')).toBeVisible();
    await expect(page.getByText('شهر الزامی است.')).toBeVisible();
    await expect(page.getByText('نشانی الزامی است.')).toBeVisible();
  });

  test('successful mocked registration navigates to dashboard business', async ({
    page,
  }) => {
    await seedAuthenticatedSession(page);

    await page.route('**/api/Business/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            userId: 'user-e2e',
            name: 'کاربر تست',
            phoneNumber: '09123456789',
          },
          accessToken: 'rotated-access',
          refreshToken: 'rotated-refresh',
          expiresAt: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    // After navigation the dashboard fetches /mine — return a loaded business.
    await page.route('**/api/business/mine', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasBusiness: true,
          business: {
            id: 1,
            name: 'سالن تست',
            city: 'تهران',
            address: 'ولیعصر',
            description: null,
            profileImageUrl: null,
            ownerId: 'user-e2e',
          },
        }),
      });
    });

    await page.goto('/register/business');
    await page.getByLabel('نام کسب‌وکار').fill('سالن تست');
    await page.getByLabel('شهر').fill('تهران');
    await page.getByLabel('نشانی').fill('ولیعصر');
    await page.getByRole('button', { name: 'ایجاد کسب‌وکار' }).click();

    await expect(page).toHaveURL(/\/dashboard\/business/);
    await expect(page.getByRole('heading', { name: 'سالن تست' })).toBeVisible();
  });
});

test.describe('real-backend business management', () => {
  test('authenticated user can open /dashboard/business', async ({ page }) => {
    skipWithoutCreds();

    await page.goto('/login');
    await page.getByLabel('شماره موبایل', { exact: true }).fill(TEST_PHONE);
    await page.getByLabel('رمز عبور', { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'ورود به پنل' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/dashboard/business');
    await expect(page).not.toHaveURL(/\/login/);
    // Either the upgrade form or the owned-business view.
    await expect(
      page
        .getByRole('heading', { name: /ارتقا به مدیر سالن|ویرایش کسب‌وکار|کسب‌وکار/ })
        .or(page.getByText('ارتقا به مدیر سالن'))
        .or(page.getByRole('button', { name: 'ویرایش' })),
    ).toBeVisible({ timeout: 15_000 });
  });
});
