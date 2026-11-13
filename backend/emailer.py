"""Emergent-managed transactional email (Resend).

Sends from Emergent's shared, platform-verified domain. Follow the guardrails:
recipients come from server-side records, bodies from the fixed templates below,
never from caller input. See integration playbook.
"""
import os
import re
import ipaddress
import logging
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Emergent managed email proxy. CONSTANT — never read from env (survives deploy).
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Sound Healing Greece")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
# Public web origin of the Expo app (used to build receiver feedback links).
PUBLIC_WEB_URL = (
    os.environ.get("PUBLIC_WEB_URL")
    or os.environ.get("CORS_ORIGINS", "").split(",")[0].strip()
    or ""
).rstrip("/")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = (
    "reply with your password", "reply with the code", "send your password", "cvv",
    "send us your password", "enter your password below", "confirm your card number",
    "your full card number", "seed phrase", "recovery phrase", "verify your card",
    "social security number", "confirm your bank details",
)
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    """Send one transactional email. Returns provider id, or None if email is
    not configured / send failed (never raises, so core flows are unaffected)."""
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set — skipping email send to %s", to)
        return None
    if not to:
        return None
    try:
        _assert_safe_email(subject, html)
    except ValueError as e:
        logger.error("Email blocked by guardrail: %s", e)
        return None
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:  # non-critical: log and continue
        logger.error("Email send error to %s: %s", to, str(e))
        return None


_FOOTER = (
    '<p style="font-size:12px;color:#8A93A3;margin-top:24px">'
    "Στάλθηκε από το Sound Healing Greece. Δεν ζητάμε ποτέ κωδικούς ή στοιχεία "
    "πληρωμής μέσω email.</p>"
)


def _wrap(inner: str) -> str:
    return (
        '<table role="presentation" width="100%" style="background:#F3F6F8;padding:24px">'
        '<tr><td align="center"><table role="presentation" width="100%" '
        'style="max-width:520px;background:#FFFFFF;border-radius:14px;padding:28px;'
        'font-family:Arial,Helvetica,sans-serif;color:#293344">'
        f"<tr><td>{inner}{_FOOTER}</td></tr></table></td></tr></table>"
    )


async def send_membership_decision(*, to: str, name: str, approved: bool, note: str = "") -> str | None:
    safe_name = escape(name or "")
    safe_note = escape(note or "")
    if approved:
        subject = "Η εγγραφή σου στο Sound Healing Greece εγκρίθηκε"
        lead = (
            f"<p>Γεια σου {safe_name},</p>"
            "<p>Η εγγραφή σου στο <strong>Sound Healing Greece</strong> εγκρίθηκε. "
            "Μπορείς πλέον να συνδεθείς και να δεις το προφίλ και τη σχολή σου.</p>"
        )
    else:
        subject = "Ενημέρωση για την αίτηση εγγραφής σου"
        lead = (
            f"<p>Γεια σου {safe_name},</p>"
            "<p>Ευχαριστούμε για το ενδιαφέρον σου. Η αίτηση εγγραφής σου στο "
            "<strong>Sound Healing Greece</strong> δεν εγκρίθηκε αυτή τη στιγμή.</p>"
        )
    note_html = f"<p>{safe_note}</p>" if safe_note else ""
    return await send_email(to=to, subject=subject, html=_wrap(lead + note_html))


async def send_receiver_feedback_invite(
    *, to: str, receiver_name: str, practitioner_name: str,
    session_date: str, session_type: str, feedback_token: str,
) -> str | None:
    if not PUBLIC_WEB_URL.startswith("https://"):
        logger.warning("PUBLIC_WEB_URL not https — skipping receiver invite email")
        return None
    link = f"{PUBLIC_WEB_URL}/feedback/{feedback_token}"
    subject = "Μοιράσου την εμπειρία σου — Sound Healing Greece"
    inner = (
        f"<p>Γεια σου {escape(receiver_name or '')},</p>"
        f"<p>Ο/Η <strong>{escape(practitioner_name or 'θεραπευτής')}</strong> σε προσκαλεί "
        f"να μοιραστείς την εμπειρία σου από τη συνεδρία ήχου "
        f"({escape(session_type or '')}, {escape(session_date or '')}).</p>"
        '<p style="margin:24px 0">'
        f'<a href="{escape(link)}" style="background:#69577F;color:#FFFFFF;'
        'text-decoration:none;padding:12px 22px;border-radius:10px;display:inline-block">'
        "Άνοιξε τη φόρμα αξιολόγησης</a></p>"
        "<p style=\"font-size:13px;color:#617083\">Ο σύνδεσμος είναι προσωπικός για εσένα.</p>"
    )
    return await send_email(to=to, subject=subject, html=_wrap(inner))



async def send_account_link(*, to: str, purpose: str, link: str) -> str | None:
    title = "Επιβεβαίωση email" if purpose == "verify" else "Αλλαγή κωδικού"
    inner = (f"<h2>{title}</h2><p>Ο σύνδεσμος ισχύει για 30 λεπτά και χρησιμοποιείται μία φορά.</p>"
             f'<p><a href="{escape(link)}">{title}</a></p>'
             '<p>Αν δεν ζήτησες αυτή την ενέργεια, αγνόησε αυτό το email.</p>')
    return await send_email(to=to, subject=title + " — Sound Healing Greece", html=_wrap(inner))
