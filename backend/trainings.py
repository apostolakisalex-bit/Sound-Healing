"""Live training-seminar feed, scraped from soundhealing.gr.

Pulls the active/upcoming educational seminars straight from the public
website so the app's "Εκπαιδευτικά" list stays current without manual edits.
Results are cached in-memory (6h TTL) and fall back to a baked-in snapshot
when the site is unreachable, so the app never shows an empty list.
"""
from __future__ import annotations

import logging
import re
import time
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import quote, urlsplit, urlunsplit

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException

logger = logging.getLogger("shg.trainings")

SOURCE = "https://www.soundhealing.gr/el/ekpaideftika-seminaria/"
BASE = "https://www.soundhealing.gr"
ALLOWED_HOSTS = {"www.soundhealing.gr", "soundhealing.gr"}
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
TTL = 6 * 3600  # seconds
FALLBACK_TTL = 1800  # retry the live site every 30 min while on fallback
MAX_SEMINARS = 12

_CACHE: dict = {"ts": 0.0, "items": [], "is_fallback": False}

MONTHS = {
    "ιαν": 1, "ιανουαρ": 1,
    "φεβ": 2, "φεβρουαρ": 2, "φλεβαρ": 2,
    "μαρ": 3, "μαρτ": 3,
    "απρ": 4, "απριλ": 4,
    "μαι": 5, "μαϊ": 5, "μαη": 5, "μαΐ": 5,
    "ιουν": 6, "ιουνι": 6,
    "ιουλ": 7, "ιουλι": 7,
    "αυγ": 8, "αυγουστ": 8,
    "σεπ": 9, "σεπτεμβρ": 9,
    "οκτ": 10, "οκτωβρ": 10,
    "νοε": 11, "νοεμ": 11, "νοεμβρ": 11,
    "δεκ": 12, "δεκεμβρ": 12,
}

# Baked-in snapshot (verified 2026-06 from soundhealing.gr) — primary source
# while the live site blocks automated requests; auto-refreshed when reachable.
_L1_PROGRAM = [
    "Την ιστορία και τις θεωρητικές βάσεις των Tibetan singing bowls",
    "Τα οφέλη και τις επιδράσεις της ηχοθεραπείας μέσα από σύγχρονες επιστημονικές μελέτες",
    "Διαφορετικές θεραπευτικές προσεγγίσεις και παραδόσεις (Θιβετιανή, Βεδική)",
    "Βασικές τεχνικές και πρακτικές συμβουλές για τον χειρισμό των singing bowls",
    "Τρόπους εφαρμογής πάνω στο σώμα αλλά και στον χώρο γύρω από αυτό",
    "Ασκήσεις και πρωτόκολλα για συνεδρίες σε τρίτους ή για αυτοθεραπεία",
    "Ανάπτυξη δεξιοτήτων και ποιότητας παρουσίας του θεραπευτή",
    "Κατευθύνσεις για την επιλογή και αγορά singing bowls (μεμονωμένα ή σετ)",
]
_L1_AUDIENCE = [
    "Ολιστικούς και εναλλακτικούς θεραπευτές",
    "Επαγγελματίες μασάζ και σωματοθεραπείας",
    "Δασκάλους γιόγκα και καθοδηγητές διαλογισμού",
    "Ψυχοθεραπευτές και συμβούλους ψυχικής υγείας",
    "Όσους θέλουν να εμπλουτίσουν τις θεραπευτικές τους μεθόδους",
    "Άτομα που επιθυμούν θεραπευτικούς ήχους για προσωπική ανάπτυξη & χαλάρωση",
]
_L2_PROGRAM = [
    "Ενεργειακή αξιολόγηση — τεχνικές για αξιολόγηση & εναρμόνιση ενεργειακών ανισορροπιών",
    "Προχωρημένα πρωτόκολλα για χρήση πάνω και εκτός σώματος",
    "Αισθητηριακή επίγνωση — λεπτές μετατοπίσεις στην ενέργεια και τον ήχο",
    "Εφαρμογές ειδικών περιπτώσεων (άγχος, κόπωση, εγκυμοσύνη, καθιστή θέση)",
    "Εξισορρόπηση ενεργειακών κέντρων με έως και επτά singing bowls",
    "Εισαγωγή πρόσθετων εργαλείων (κρυστάλλινα bowls, tingsha, chimes, νερό, κρύσταλλοι)",
    "Ολιστική προσέγγιση — συνδυασμός με μασάζ, συμβουλευτική, reiki κ.ά.",
    "Υποστήριξη μετά το σεμινάριο (αξιολόγηση πρακτικών, ομάδες Facebook & Viber)",
]
_INSTRUCTOR = "Μανώλης Ζωγραφάκης — πιστοποιημένος ηχοθεραπευτής, μέλος του IPHM."
_CERT_L1 = "Βεβαίωση παρακολούθησης· το πιστοποιητικό ολοκλήρωσης απονέμεται μετά τις ώρες πρακτικής άσκησης."
_ADDR_ATHENS = "Healing Circle Yoga — Τιμάνδρας 14 & Ανακρέοντος, Ζωγράφου 157 71"
_L1_DESC = (
    "Διήμερο εισαγωγικό σεμινάριο ηχοθεραπείας με Θιβετιανά singing bowls, με έμφαση "
    "στον διαλογισμό, τη βαθιά χαλάρωση και τη θεραπευτική εφαρμογή. Δεν απαιτείται "
    "προηγούμενη εμπειρία. Περιλαμβάνει 16 ώρες δια ζώσης & 15 ώρες προσωπικής πρακτικής."
)

FALLBACK = [
    {
        "slug": "seminario-ixotherapias-athina-31-1-noemvriou-2026",
        "url": f"{BASE}/el/seminario-ixotherapias-athina-31-1-noemvriou-2026/",
        "full_title": "Εκπαιδευτικό Σεμινάριο Ηχοθεραπείας — Βασικό Επίπεδο",
        "title": "Level 1 · Αθήνα", "level": 1, "location": "Αθήνα",
        "date": "31 Οκτ & 1 Νοε 2026", "start_date": "2026-10-31", "end_date": "2026-11-01",
        "image": f"{BASE}/wp-content/uploads/2026/05/TRAINING-SEMINAR-%CE%95%CE%9A%CE%A0%CE%91%CE%99%CE%94%CE%95%CE%A5%CE%A4%CE%99%CE%9A%CE%9F-%CE%A3%CE%95%CE%9C%CE%99%CE%9D%CE%91%CE%A1%CE%99%CE%9F-1500x1000.jpg",
        "price": "Early Bird €300 έως 1 Αυγ · €350 μετά", "time": "10:00 – 18:00",
        "address": _ADDR_ATHENS, "language": "Ελληνικά", "max_participants": "10",
        "phone": "6945562818", "description": _L1_DESC,
        "program": _L1_PROGRAM, "audience": _L1_AUDIENCE,
        "instructor": _INSTRUCTOR, "certification": _CERT_L1,
    },
    {
        "slug": "ekpaideftiko-seminario-ixotherapeias-epipedo-2-athina-6-8-noemvriou-2026",
        "url": f"{BASE}/el/ekpaideftiko-seminario-ixotherapeias-epipedo-2-athina-6-8-noemvriou-2026/",
        "full_title": "Εκπαιδευτικό Σεμινάριο Ηχοθεραπείας — 2ο Επίπεδο",
        "title": "Level 2 · Αθήνα", "level": 2, "location": "Αθήνα",
        "date": "6–8 Νοεμβρίου 2026", "start_date": "2026-11-06", "end_date": "2026-11-08",
        "image": f"{BASE}/wp-content/uploads/2026/02/Training-Seminars-1-1500x1000.jpg",
        "price": "Early Bird €330 έως 1 Αυγ · €360 μετά", "time": "Παρ 18:30–20:30 (online) · Σάβ & Κυρ 10:00–18:00",
        "address": "Ginger Yoga Studio — Δημοσθένους Καλεμκερή 21, Ραφήνα 190 09",
        "language": "Ελληνικά", "max_participants": "10", "phone": "6945562818",
        "description": (
            "Τριήμερη εκπαίδευση 2ου επιπέδου για όσους ολοκλήρωσαν το Επίπεδο 1 και τις 15 "
            "πρακτικές. Εμβάθυνση στη θεραπευτική χρήση των singing bowls με επιπλέον τεχνικές "
            "και εργαλεία. Διαπιστευμένο από τον IPHM."
        ),
        "program": _L2_PROGRAM,
        "audience": ["Απόφοιτοι Επιπέδου 1 που έχουν ολοκληρώσει τις 15 πρακτικές ασκήσεις"],
        "instructor": _INSTRUCTOR,
        "certification": "Βεβαίωση παρακολούθησης· η βεβαίωση ολοκλήρωσης Επιπέδων 1 & 2 δίνεται μετά τις απαιτούμενες πρακτικές.",
    },
    {
        "slug": "ekpaideftiko-seminario-ixotherapias-level1-28-29-noemvriou-athina",
        "url": f"{BASE}/el/ekpaideftiko-seminario-ixotherapias-level1-28-29-noemvriou-athina/",
        "full_title": "Εκπαιδευτικό Σεμινάριο Ηχοθεραπείας — Βασικό Επίπεδο",
        "title": "Level 1 · Αθήνα", "level": 1, "location": "Αθήνα",
        "date": "28 & 29 Νοεμβρίου 2026", "start_date": "2026-11-28", "end_date": "2026-11-29",
        "image": f"{BASE}/wp-content/uploads/2026/08/TRAINING-SEMINAR-%CE%95%CE%9A%CE%A0%CE%91%CE%99%CE%94%CE%95%CE%A5%CE%A4%CE%99%CE%9A%CE%9F-%CE%A3%CE%95%CE%9C%CE%99%CE%9D%CE%91%CE%A1%CE%99%CE%9F-2-1500x1000.png",
        "price": "€350", "time": "10:00 – 18:00",
        "address": _ADDR_ATHENS, "language": "Ελληνικά", "max_participants": "10",
        "phone": "6945562818", "description": _L1_DESC,
        "program": _L1_PROGRAM, "audience": _L1_AUDIENCE,
        "instructor": _INSTRUCTOR, "certification": _CERT_L1,
    },
]

SUMMARY_FIELDS = (
    "slug", "url", "title", "level", "location", "date", "start_date", "end_date", "image", "price",
)


def _month_from_word(word: str) -> Optional[int]:
    w = word.lower()
    best = None
    best_len = 0
    for key, num in MONTHS.items():
        if w.startswith(key) and len(key) > best_len:
            best, best_len = num, len(key)
    return best


def _parse_greek_range(text: str) -> tuple:
    """Return (start_iso, end_iso) for a Greek date string, or ('', '')."""
    if not text:
        return "", ""
    low = text.lower()
    year_m = re.search(r"(20\d{2})", low)
    if not year_m:
        return "", ""
    year = int(year_m.group(1))
    months = []
    for m in re.finditer(r"[α-ωά-ώϊϋΐΰ]+", low):
        num = _month_from_word(m.group(0))
        if num:
            months.append((m.start(), num))
    days = []
    for m in re.finditer(r"\b(\d{1,2})\b", low):
        d = int(m.group(1))
        if 1 <= d <= 31:
            days.append((m.start(), d))
    if not months or not days:
        return "", ""
    candidates = []
    for pos, d in days:
        right = [mn for mp, mn in months if mp >= pos]
        chosen = right[0] if right else months[-1][1]
        candidates.append((year, chosen, d))
    start = min(candidates)
    end = max(candidates)
    iso = lambda c: f"{c[0]:04d}-{c[1]:02d}-{c[2]:02d}"
    return iso(start), iso(end)


def _detect_level(text: str) -> Optional[int]:
    t = text.lower()
    if re.search(r"epipedo-?4|level-?4|επίπεδο 4|4ο επίπεδο|τέταρτο", t):
        return 4
    if re.search(r"epipedo-?3|level-?3|επίπεδο 3|3ο επίπεδο|τρίτο", t):
        return 3
    if re.search(r"epipedo-?2|level-?2|επίπεδο 2|2ο επίπεδο|δεύτερο", t):
        return 2
    if re.search(r"epipedo-?1|level-?1|επίπεδο 1|1ο επίπεδο|βασικ|πρώτο", t):
        return 1
    return None


def _detect_location(text: str) -> str:
    t = text.lower()
    if "αθήν" in t or "αθην" in t or "athina" in t or "athens" in t:
        return "Αθήνα"
    if "χανι" in t or "chania" in t:
        return "Χανιά"
    if "θεσσαλον" in t or "thessalon" in t:
        return "Θεσσαλονίκη"
    return ""


def _meta(soup: BeautifulSoup, prop: str) -> str:
    tag = soup.find("meta", attrs={"property": prop}) or soup.find(
        "meta", attrs={"name": prop}
    )
    return (tag.get("content") or "").strip() if tag else ""


def _enc_url(u: str) -> str:
    """Percent-encode non-ASCII path chars so RN <Image> can load the URL."""
    if not u:
        return u
    try:
        p = urlsplit(u)
        return urlunsplit((p.scheme, p.netloc, quote(p.path, safe="/%"), p.query, ""))
    except Exception:  # noqa: BLE001
        return u


def _list_after(soup: BeautifulSoup, keyword: str) -> list:
    for h in soup.find_all(["h2", "h3", "h4", "strong", "p"]):
        if keyword in h.get_text(" ", strip=True).lower():
            ul = h.find_next("ul")
            if ul:
                items = [li.get_text(" ", strip=True) for li in ul.find_all("li")]
                return [x for x in items if x][:12]
            break
    return []


def _parse_detail(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    slug = url.rstrip("/").rsplit("/", 1)[-1]
    full_title = _meta(soup, "og:title") or (
        soup.find("h1").get_text(" ", strip=True) if soup.find("h1") else slug
    )
    full_title = re.sub(r"\s*[-–|]\s*Soundhealing.*$", "", full_title, flags=re.I).strip()
    image = _enc_url(_meta(soup, "og:image"))
    description = _meta(soup, "og:description") or _meta(soup, "description")

    # Scan single-line element texts for the "Πληροφορίες Σεμιναρίου" fields.
    lines = []
    for el in soup.find_all(["li", "p"]):
        txt = el.get_text(" ", strip=True)
        if txt:
            lines.append(txt)
    blob = "\n".join(lines)

    def grab(label_re: str) -> str:
        m = re.search(label_re + r"\s*:?\s*(.+)", blob, flags=re.I)
        return m.group(1).strip() if m else ""

    date = grab(r"Ημερομηνία")
    time_v = grab(r"Ώρα")
    address = grab(r"Διεύθυνση")
    language = grab(r"Γλώσσα")
    maxp = ""
    mm = re.search(r"Μέγιστος αριθμός[^:]*:?\s*(\d+)", blob, flags=re.I)
    if mm:
        maxp = mm.group(1)
    price = ""
    pm = re.search(r"Κόστος\s*:?\s*([€\d.,\s]+)", blob, flags=re.I)
    if pm:
        price = pm.group(1).strip()
    if not price:
        pm2 = re.search(r"€\s?(\d{2,4})", blob)
        if pm2:
            price = "€" + pm2.group(1)
    phone = ""
    ph = re.search(r"\b(69\d{8}|2\d{9})\b", blob)
    if ph:
        phone = ph.group(1)
    certification = ""
    cm = re.search(r"Πιστοποίηση\s*:?\s*(.+)", blob, flags=re.I)
    if cm:
        certification = cm.group(1).strip()[:300]

    program = _list_after(soup, "θα εξετάσουμε") or _list_after(soup, "θα δούμε")
    audience = _list_after(soup, "απευθύνεται")

    hay = f"{slug} {full_title}"
    level = _detect_level(hay)
    location = _detect_location(f"{hay} {address} {date}")
    start_date, end_date = _parse_greek_range(date)

    short = full_title
    if level and location:
        short = f"Level {level} · {location}"

    # Trim description to a reasonable preview length.
    if description and len(description) > 320:
        description = description[:317].rstrip() + "…"

    return {
        "slug": slug, "url": url, "full_title": full_title, "title": short,
        "level": level, "location": location, "image": image,
        "date": date, "start_date": start_date, "end_date": end_date, "time": time_v, "address": address,
        "price": price, "language": language, "max_participants": maxp,
        "phone": phone or "6945562818", "description": description,
        "program": program, "audience": audience, "certification": certification,
    }


def _seminar_links(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    seen = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/"):
            href = BASE + href
        if BASE not in href:
            continue
        low = href.lower()
        if "/el/" not in low:
            continue
        if "seminario" not in low and "seminar" not in low:
            continue
        if "/wp-content/" in low or re.search(
            r"\.(jpg|jpeg|png|webp|gif|pdf|mp3|mp4|svg)$", low.split("?")[0]
        ):
            continue
        if any(x in low for x in (
            "/category/", "/tag/", "/author/", "ekpaideftika-seminaria",
            "ekpaideftika-programmata", "/feed", "#",
        )):
            continue
        href = href.split("#")[0].rstrip("/") + "/"
        if href not in seen:
            seen.append(href)
    return seen[:MAX_SEMINARS]


def _today_iso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


# Curated depth keyed by slug; live scraping supplies freshness + new seminars.
CURATED = {it["slug"]: it for it in FALLBACK}


def _merge(live: dict) -> dict:
    base = CURATED.get(live["slug"])
    if not base:
        return live
    merged = dict(base)
    # Fresh scheduling/discovery fields always follow the live site.
    for k in ("date", "start_date", "end_date", "image", "url", "full_title", "time",
              "language", "max_participants"):
        if live.get(k):
            merged[k] = live[k]
    # Depth fields: keep the curated copy, fall back to live only if missing.
    for k in ("program", "audience", "address", "price", "description",
              "certification", "instructor", "phone"):
        if not merged.get(k) and live.get(k):
            merged[k] = live[k]
    return merged


async def _scrape() -> list:
    headers = {"User-Agent": UA, "Accept-Language": "el,en;q=0.8"}
    async with httpx.AsyncClient(
        headers=headers, timeout=15.0, follow_redirects=True, max_redirects=3
    ) as cx:
        listing = await cx.get(SOURCE)
        listing.raise_for_status()
        if listing.url.host not in ALLOWED_HOSTS:
            raise ValueError(f"listing redirected off-site: {listing.url.host}")
        links = _seminar_links(listing.text)
        items = []
        for url in links:
            try:
                r = await cx.get(url)
                r.raise_for_status()
                if r.url.host not in ALLOWED_HOSTS:
                    logger.warning("skip off-site redirect: %s", r.url.host)
                    continue
                items.append(_parse_detail(r.text, url))
            except Exception as exc:  # noqa: BLE001
                logger.warning("training detail failed %s: %s", url, exc)
        today = _today_iso()
        active = [
            _merge(it) for it in items
            if not it["end_date"] or it["end_date"] >= today
        ]
        active.sort(key=lambda it: it["end_date"] or "9999")
        return active


async def get_items(force: bool = False) -> list:
    now = time.time()
    if not force and _CACHE["items"]:
        fresh = FALLBACK_TTL if _CACHE["is_fallback"] else TTL
        if now - _CACHE["ts"] < fresh:
            return _CACHE["items"]
    try:
        items = await _scrape()
        if items:
            _CACHE.update(items=items, ts=now, is_fallback=False)
            return items
        raise ValueError("empty scrape result")
    except Exception as exc:  # noqa: BLE001
        logger.warning("training scrape failed, using fallback: %s", exc)
        if _CACHE["items"] and not _CACHE["is_fallback"]:
            return _CACHE["items"]
        _CACHE.update(items=FALLBACK, ts=now, is_fallback=True)
        return FALLBACK


def build_trainings_router() -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/trainings/active")
    async def active_trainings():
        items = await get_items()
        return {"items": [{k: it.get(k, "") for k in SUMMARY_FIELDS} for it in items]}

    @router.get("/trainings/{slug}")
    async def training_detail(slug: str):
        items = await get_items()
        for it in items:
            if it["slug"] == slug:
                return it
        for it in FALLBACK:
            if it["slug"] == slug:
                return it
        raise HTTPException(status_code=404, detail="Το σεμινάριο δεν βρέθηκε")

    return router
