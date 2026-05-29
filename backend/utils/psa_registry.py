# Selectors verified against live site — re-check if PSA updates UI
"""
PSA Set Registry automation via Playwright.

The PSA *public* API is read-only, so adding a cert to a user's Set Registry has
to be driven through the website UI. PSA brokers authentication through the
shared Collectors identity provider: visiting an account page while logged-out
bounces the browser to ``app.collectors.com/signin`` (a two-step email →
password form). Once authenticated the registry dashboard lives under
``/psasetregistry/mysetregistry/dashboard`` and cards are added through a
"New Slot" / "Add Item" affordance that takes a certification number.

Every selector below is wrapped in try/except and layered with fallbacks so the
functions degrade gracefully (returning ``False``) instead of raising — callers
treat ``False`` as "could not sync, leave for manual review".
"""
import logging
import re
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)

# ── Live-site constants ───────────────────────────────────────────────────────
_TIMEOUT_MS = 30_000

# Hitting the account page while logged-out redirects to the Collectors sign-in
# host; presence of that host in the URL is our "still logged out" signal.
_LOGIN_URL = "https://www.psacard.com/myaccount/login"
_SIGNIN_HOST = "collectors.com/signin"
_REGISTRY_DASHBOARD_URL = "https://www.psacard.com/psasetregistry/mysetregistry/dashboard"

# Module-level session cache keyed by PSA email. We persist Playwright
# storage_state (cookies + localStorage) so a batch of cards from one invoice
# reuses a single login instead of re-authenticating for every cert.
_sessions: dict[str, Any] = {}


# ── Authentication ────────────────────────────────────────────────────────────
def _login(page, email: str, password: str) -> bool:
    """Authenticate ``page`` against PSA/Collectors. Returns True on success."""
    try:
        logger.info("[PSA Registry] Navigating to login page")
        page.goto(_LOGIN_URL, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Failed to load login page")
        return False

    try:
        logger.info("[PSA Registry] Entering email")
        page.fill(
            'input[type="email"], input[name="email"], input#email, input[name="username"]',
            email,
        )
    except Exception:
        logger.exception("[PSA Registry] Could not locate email field")
        return False

    # Modern Collectors login is a two-step form: enter email, click Continue,
    # then enter password. Older inline forms expose both fields at once, so we
    # only advance the form when no password field is visible yet.
    try:
        if page.locator('input[type="password"]').count() == 0:
            logger.info("[PSA Registry] Advancing two-step login (Continue)")
            page.click(
                'button[type="submit"], button:has-text("Continue"), button:has-text("Next")'
            )
            page.wait_for_selector('input[type="password"]', timeout=_TIMEOUT_MS)
    except Exception:
        logger.warning("[PSA Registry] Two-step advance skipped or not required")

    try:
        logger.info("[PSA Registry] Entering password")
        page.fill(
            'input[type="password"], input[name="password"], input#password',
            password,
        )
    except Exception:
        logger.exception("[PSA Registry] Could not locate password field")
        return False

    try:
        logger.info("[PSA Registry] Submitting credentials")
        page.click(
            'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")'
        )
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Failed to submit login form")
        return False

    # A logged-out session is bounced to the sign-in host; a logged-in session
    # lands back on a psacard.com page.
    try:
        ok = _SIGNIN_HOST not in page.url
        logger.info(
            "[PSA Registry] Login %s (url=%s)",
            "succeeded" if ok else "failed",
            page.url,
        )
        return ok
    except Exception:
        logger.exception("[PSA Registry] Could not verify login state")
        return False


def _open_context(p, email: str, password: str):
    """Launch a headless browser + a logged-in context.

    Reuses a cached ``storage_state`` for ``email`` when available (re-logging in
    only if the cached cookies have expired). Returns ``(browser, context)`` or
    ``(None, None)`` on failure.
    """
    browser = None
    try:
        browser = p.chromium.launch(headless=True)
        storage = _sessions.get(email)
        context = (
            browser.new_context(storage_state=storage)
            if storage
            else browser.new_context()
        )
        context.set_default_timeout(_TIMEOUT_MS)

        page = context.new_page()
        logged_in = False
        if storage:
            logger.info("[PSA Registry] Reusing cached session for %s", email)
            try:
                page.goto(_REGISTRY_DASHBOARD_URL, wait_until="domcontentloaded")
                logged_in = _SIGNIN_HOST not in page.url
            except Exception:
                logger.exception("[PSA Registry] Cached session check failed")
                logged_in = False

        if not logged_in:
            logger.info("[PSA Registry] Logging in for %s", email)
            logged_in = _login(page, email, password)

        if not logged_in:
            page.close()
            browser.close()
            return None, None

        # Persist the (possibly refreshed) session for the rest of the batch.
        try:
            _sessions[email] = context.storage_state()
        except Exception:
            logger.exception("[PSA Registry] Failed to cache session for %s", email)

        page.close()
        return browser, context
    except Exception:
        logger.exception("[PSA Registry] Failed to open registry context")
        if browser is not None:
            try:
                browser.close()
            except Exception:
                pass
        return None, None


# ── Registry actions ──────────────────────────────────────────────────────────
def _search_cert(page, cert_number: str) -> bool:
    """Return True if ``cert_number`` already appears in the user's registry."""
    try:
        logger.info("[PSA Registry] Loading registry dashboard to search %s", cert_number)
        page.goto(_REGISTRY_DASHBOARD_URL, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Failed to load registry dashboard")
        return False

    # Prefer an on-page search box; fall back to scanning rendered text.
    try:
        search = page.locator(
            'input[type="search"], input[placeholder*="search" i], input[placeholder*="cert" i]'
        ).first
        if search.count() > 0:
            logger.info("[PSA Registry] Filtering registry by cert %s", cert_number)
            search.fill(cert_number)
            search.press("Enter")
            page.wait_for_load_state("networkidle")
    except Exception:
        logger.warning("[PSA Registry] Search box unavailable — scanning page text")

    try:
        found = page.get_by_text(cert_number, exact=False).count() > 0
        logger.info(
            "[PSA Registry] Cert %s %s in registry",
            cert_number,
            "found" if found else "not found",
        )
        return found
    except Exception:
        logger.exception("[PSA Registry] Failed to evaluate search results for %s", cert_number)
        return False


def _add_cert(page, cert_number: str) -> bool:
    """Add ``cert_number`` to the registry and confirm success."""
    try:
        logger.info("[PSA Registry] Loading registry dashboard to add %s", cert_number)
        page.goto(_REGISTRY_DASHBOARD_URL, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Failed to load registry dashboard")
        return False

    # Open the add-card affordance ("New Slot" / "Add Item" / "Add Card").
    try:
        logger.info("[PSA Registry] Opening add-card form for %s", cert_number)
        trigger = page.get_by_role(
            "button", name=re.compile(r"new slot|add item|add card|add", re.I)
        )
        if trigger.count() == 0:
            trigger = page.locator(
                'a:has-text("New Slot"), a:has-text("Add Item"), '
                'a:has-text("Add Card"), button:has-text("Add")'
            )
        trigger.first.click()
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Could not open add-card form for %s", cert_number)
        return False

    # Enter the certification number.
    try:
        logger.info("[PSA Registry] Entering cert number %s", cert_number)
        page.fill(
            'input[name="certNumber"], input[name="cert"], '
            'input[placeholder*="cert" i], input[type="text"]',
            cert_number,
        )
    except Exception:
        logger.exception("[PSA Registry] Could not locate cert number field for %s", cert_number)
        return False

    # Submit.
    try:
        logger.info("[PSA Registry] Submitting cert %s", cert_number)
        submit = page.get_by_role("button", name=re.compile(r"submit|add|save", re.I))
        if submit.count() == 0:
            submit = page.locator('button[type="submit"]')
        submit.first.click()
        page.wait_for_load_state("networkidle")
    except Exception:
        logger.exception("[PSA Registry] Failed to submit cert %s", cert_number)
        return False

    # Confirm success: a confirmation cue, or the cert now showing in the set.
    try:
        confirmed = (
            page.get_by_text(re.compile(r"added|success|submitted", re.I)).count() > 0
            or page.get_by_text(cert_number, exact=False).count() > 0
        )
        logger.info(
            "[PSA Registry] Add cert %s %s",
            cert_number,
            "confirmed" if confirmed else "unconfirmed",
        )
        return confirmed
    except Exception:
        logger.exception("[PSA Registry] Could not confirm add for %s", cert_number)
        return False


# ── Lifecycle helpers ─────────────────────────────────────────────────────────
def _run(
    email: str,
    password: str,
    context: Optional[Any],
    work: Callable[[Any], bool],
) -> bool:
    """Run ``work(page)`` against a logged-in registry page.

    When ``context`` is supplied (a shared, already-logged-in batch context) it
    is reused as-is. Otherwise a private browser/context is created, reusing the
    cached session for ``email`` when possible.
    """
    # Path 1 — caller-supplied shared context (already authenticated).
    if context is not None:
        page = None
        try:
            page = context.new_page()
            page.set_default_timeout(_TIMEOUT_MS)
            return work(page)
        except Exception:
            logger.exception("[PSA Registry] Work failed on shared context")
            return False
        finally:
            if page is not None:
                try:
                    page.close()
                except Exception:
                    pass

    # Path 2 — manage our own Playwright lifecycle.
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        logger.exception("[PSA Registry] Playwright is not available")
        return False

    try:
        with sync_playwright() as p:
            browser, ctx = _open_context(p, email, password)
            if ctx is None:
                return False
            page = None
            try:
                page = ctx.new_page()
                page.set_default_timeout(_TIMEOUT_MS)
                return work(page)
            except Exception:
                logger.exception("[PSA Registry] Work failed")
                return False
            finally:
                if page is not None:
                    try:
                        page.close()
                    except Exception:
                        pass
                try:
                    browser.close()
                except Exception:
                    pass
    except Exception:
        logger.exception("[PSA Registry] Unexpected Playwright failure")
        return False


def open_registry_context(email: str, password: str) -> Optional[dict]:
    """Open a reusable, logged-in Playwright context for a batch of cards.

    Returns a bundle ``{"playwright", "browser", "context"}`` to pass as the
    ``context=`` argument of :func:`is_in_registry` / :func:`add_to_registry`,
    or ``None`` on failure. Always pair with :func:`close_registry_context`.
    """
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        logger.exception("[PSA Registry] Playwright is not available")
        return None

    pw = None
    try:
        pw = sync_playwright().start()
        browser, context = _open_context(pw, email, password)
        if context is None:
            pw.stop()
            return None
        logger.info("[PSA Registry] Opened shared registry context for %s", email)
        return {"playwright": pw, "browser": browser, "context": context}
    except Exception:
        logger.exception("[PSA Registry] Failed to open shared registry context")
        if pw is not None:
            try:
                pw.stop()
            except Exception:
                pass
        return None


def close_registry_context(bundle: Optional[dict]) -> None:
    """Tear down a context opened by :func:`open_registry_context`."""
    if not bundle:
        return
    browser = bundle.get("browser")
    if browser is not None:
        try:
            browser.close()
        except Exception:
            logger.exception("[PSA Registry] Failed to close browser")
    pw = bundle.get("playwright")
    if pw is not None:
        try:
            pw.stop()
        except Exception:
            logger.exception("[PSA Registry] Failed to stop Playwright")


# ── Public API ────────────────────────────────────────────────────────────────
def is_in_registry(
    email: str,
    password: str,
    cert_number: str,
    context: Optional[Any] = None,
) -> bool:
    """Return True if ``cert_number`` is already in the user's Set Registry.

    Logs in (or reuses ``context`` / a cached session), navigates to the
    registry, searches for the cert, and returns a bool. Never raises.
    """
    logger.info("[PSA Registry] is_in_registry(cert=%s)", cert_number)
    return _run(email, password, context, lambda page: _search_cert(page, cert_number))


def add_to_registry(
    email: str,
    password: str,
    cert_number: str,
    context: Optional[Any] = None,
) -> bool:
    """Add ``cert_number`` to the user's Set Registry, confirming success.

    Logs in (or reuses ``context`` / a cached session), navigates to the
    registry, runs the add-card flow, confirms, and returns a bool. Never raises.
    """
    logger.info("[PSA Registry] add_to_registry(cert=%s)", cert_number)
    return _run(email, password, context, lambda page: _add_cert(page, cert_number))
