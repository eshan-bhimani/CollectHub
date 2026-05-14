import logging

logger = logging.getLogger(__name__)

# NOTE: PSA Registry UI may change — verify selectors against live site


def is_in_registry(email: str, password: str, cert_number: str) -> bool:
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_default_timeout(30000)

            page.goto("https://www.psacard.com/myaccount/login")
            page.fill('input[name="email"], input[type="email"]', email)
            page.fill('input[name="password"], input[type="password"]', password)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")

            page.goto("https://www.psacard.com/myaccount/mysetregistry")
            page.wait_for_load_state("networkidle")

            found = page.locator(f'text="{cert_number}"').count() > 0

            browser.close()
            return found
    except Exception:
        logger.exception("Registry check failed for cert %s", cert_number)
        return False


def add_to_registry(email: str, password: str, cert_number: str) -> bool:
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_default_timeout(30000)

            page.goto("https://www.psacard.com/myaccount/login")
            page.fill('input[name="email"], input[type="email"]', email)
            page.fill('input[name="password"], input[type="password"]', password)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")

            page.goto("https://www.psacard.com/myaccount/mysetregistry")
            page.wait_for_load_state("networkidle")

            add_btn = page.locator('text="Add Card"').first
            if add_btn.count() == 0:
                add_btn = page.locator('a:has-text("Add"), button:has-text("Add")').first
            add_btn.click()
            page.wait_for_load_state("networkidle")

            page.fill('input[name="certNumber"], input[placeholder*="cert" i]', cert_number)
            page.click('button[type="submit"], button:has-text("Add")')
            page.wait_for_load_state("networkidle")

            browser.close()
            return True
    except Exception:
        logger.exception("Registry add failed for cert %s", cert_number)
        return False
