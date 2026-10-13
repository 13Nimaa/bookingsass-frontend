import { test, expect, type Page } from '@playwright/test';

/**
 * E2E coverage for the Login page (`/login`) against the REAL backend.
 *
 * Environment:
 * - Frontend: PLAYWRIGHT_BASE_URL (default http://localhost:3000, see
 *   playwright.config.ts — the dev server is started/reused automatically).
 * - Backend: the app's own NEXT_PUBLIC_BACKEND_URL (local dev backend,
 *   never production). The suite never changes it; tests talk to the app
 *   exactly like a user would, through the UI.
 *
 * Credentials (never hardcoded, never logged):
 * - E2E_TEST_PHONE_NUMBER / E2E_TEST_PASSWORD — dedicated test account.
 *   Backend-dependent tests skip with an explicit message when unset.
 *   The failure-simulation test aborts the login request instead, so it
 *   runs deterministically with or without a backend.
 *
 * State isolation: Playwright gives every test a fresh browser context
 * (clean localStorage/cookies), so unauthenticated tests never leak into
 * authenticated ones and vice versa.
 */

const TEST_PHONE = process.env.E2E_TEST_PHONE_NUMBER ?? '';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? '';
const LIVETEST_SKIP_MESSAGE =
  'Set E2E_TEST_PHONE_NUMBER and E2E_TEST_PASSWORD and run the dev backend ' +
  '(see .env.local NEXT_PUBLIC_BACKEND_URL) to run backend-dependent login tests.';

function skipWithoutCreds() {
  test.skip(
    !TEST_PHONE || !TEST_PASSWORD,
    LIVETEST_SKIP_MESSAGE,
  );
}

async function fillLoginForm(page: Page, phone: string, password: string) {
  // Accessible labels (Input renders <label htmlFor> + <input id>).
  // `exact` avoids matching the "نمایش رمز عبور" eye-toggle button,
  // whose accessible name merely contains the password label text.
  await page.getByLabel('شماره موبایل', { exact: true }).fill(phone);
  await page.getByLabel('رمز عبور', { exact: true }).fill(password);
}

async function submitLogin(page: Page) {
  await page.getByRole('button', { name: 'ورود به پنل' }).click();
}

async function loginAsTestUser(page: Page) {
  await page.goto('/login');
  await fillLoginForm(page, TEST_PHONE, TEST_PASSWORD);
  await submitLogin(page);
  // App navigates to "/" on success (login page default redirect target).
  await expect(page).toHaveURL(/\/$/);
}

test.describe('login form validation (no backend needed)', () => {
  test('empty submit shows required-field errors and stays on /login', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: 'خوش آمدید' }),
    ).toBeVisible();

    await submitLogin(page);

    // Exact client-side (zod) messages from the login form schema.
    await expect(page.getByText('شماره موبایل الزامی است.')).toBeVisible();
    await expect(page.getByText('رمز عبور را وارد کنید.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('malformed phone number is rejected client-side', async ({ page }) => {
    await page.goto('/login');
    await fillLoginForm(page, '12345', 'SomePassword1');
    await submitLogin(page);

    await expect(
      page.getByText('شماره موبایل معتبر وارد کنید (مثال: 09123456789).'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('valid phone with empty password shows only the password error', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('شماره موبایل', { exact: true }).fill('09123456789');
    await submitLogin(page);

    await expect(page.getByText('رمز عبور را وارد کنید.')).toBeVisible();
    await expect(
      page.getByText('شماره موبایل معتبر وارد کنید (مثال: 09123456789).'),
    ).toBeHidden();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('backend failure handling', () => {
  test('aborted login request shows a form-level error without crashing', async ({
    page,
  }) => {
    // Simulate a dead backend deterministically: the real endpoint is
    // untouched in every other test; only here is the request aborted.
    await page.route('**/api/auth/login', (route) => route.abort());

    await page.goto('/login');
    await fillLoginForm(page, '09123456789', 'WrongPassword1');
    await submitLogin(page);

    // Form-level server-error box (role-less motion.div — assert user text).
    await expect(
      page.getByText('اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.'),
    ).toBeVisible();
    // Page is intact and the user is still on the login screen.
    await expect(
      page.getByRole('heading', { name: 'خوش آمدید' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('protected routes without a session (no backend needed)', () => {
  test('/dashboard/profile redirects to /login when unauthenticated', async ({
    page,
  }) => {
    // Fresh context => empty localStorage => restoreSession resolves to
    // "unauthenticated" => AuthGuard assigns /login.
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: 'خوش آمدید' }),
    ).toBeVisible();
  });
});

test.describe('real-backend authentication', () => {
  test('invalid credentials keep the user logged out with an error', async ({
    page,
  }) => {
    skipWithoutCreds();

    await page.goto('/login');
    // Correct phone, wrong password: guaranteed 401 without assuming
    // anything about unregistered numbers.
    await fillLoginForm(page, TEST_PHONE, `wrong-${TEST_PASSWORD}`);
    await submitLogin(page);

    await expect(
      page.getByText('شماره موبایل یا رمز عبور اشتباه است.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // Authenticated-only pages must still be unreachable.
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login redirects, shows authed UI, and stores the session', async ({
    page,
  }) => {
    skipWithoutCreds();

    await loginAsTestUser(page);

    // Application-level authenticated indicator: the navbar profile chip
    // (aria-label "پروفایل <name>") replaces the login/register CTAs.
    await expect(page.getByRole('link', { name: /پروفایل/ })).toBeVisible();

    // Session persistence mechanism the app relies on across reloads.
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('bf_session'),
    );
    expect(stored).not.toBeNull();
  });

  test('session survives reload; logout clears it and locks protected routes', async ({
    page,
  }) => {
    skipWithoutCreds();

    await loginAsTestUser(page);
    await page.reload();
    await expect(page.getByRole('link', { name: /پروفایل/ })).toBeVisible();

    // Logout via the dashboard sidebar (same control real users use).
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'خروج' }).click();

    // AuthGuard observes the cleared session and sends the user to login.
    await expect(page).toHaveURL(/\/login/);
    const cleared = await page.evaluate(() =>
      window.localStorage.getItem('bf_session'),
    );
    expect(cleared).toBeNull();

    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
