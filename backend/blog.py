"""Live blog feed, pulled from the soundhealing.gr WordPress REST API.

Posts are fetched once and cached in-memory (30 min TTL). Each post is
classified into "training", "events" or "general" so the app can show the
relevant articles under «Εκπαιδευτικά» and «Εκδηλώσεις» (general sound-healing
articles appear under both). Article bodies are parsed into simple blocks so
they can be rendered natively inside the app (cross-platform reader).
"""
from __future__ import annotations

import html
import logging
import re
import time
from datetime import date, datetime
from typing import Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException

logger = logging.getLogger("shg.blog")

WP_API = "https://www.soundhealing.gr/wp-json/wp/v2"
BASE = "https://www.soundhealing.gr"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
TTL = 30 * 60  # seconds
PER_PAGE = 30

_CACHE: dict = {"ts": 0.0, "posts": []}

# --- classification -------------------------------------------------------
TRAIN_SLUGS = {"training-seminars", "workshops", "workshops-el"}
EVENT_SLUGS = {
    "event", "event-en", "sound-bath-events", "sound-bath-events-en",
    "fundraiser", "fundraiser-en", "conferences", "floating-sound-bath",
    "floating-sound-bath-en", "breathwork", "breathwork-sound",
}
TRAIN_TITLE = re.compile(
    r"εκπαιδευτικ|σεμιν[αά]ρ|training seminar|practitioner training|"
    r"\blevel\b|επ[ιί]πεδο|training with|training in",
    re.IGNORECASE,
)
EVENT_TITLE = re.compile(
    r"full moon|secret|ομαδικ[ήη]|συνεδρ[ιί]α|breathwork|floating|gong bath|"
    r"φιλανθρωπικ|συν[εέ]ντευξη|\blive\b|concert|συναυλ[ιί]α|retreat|"
    r"φεστιβ[αά]λ|sound bath event",
    re.IGNORECASE,
)


def _classify(cats: list[dict], title: str) -> str:
    slugs = {(c.get("slug") or "").lower() for c in cats}
    names = " ".join((c.get("name") or "").lower() for c in cats)
    is_train_cat = bool(slugs & TRAIN_SLUGS) or ("σεμιν" in names) or (
        "seminar" in names) or ("εκπαιδευτικ" in names)
    is_event_cat = bool(slugs & EVENT_SLUGS) or ("event" in names) or (
        "bath" in names) or ("breathwork" in names) or ("fundraiser" in names)

    if is_train_cat and not is_event_cat:
        return "training"
    if is_event_cat and not is_train_cat:
        return "events"
    if is_train_cat and is_event_cat:
        return "training" if TRAIN_TITLE.search(title or "") else "events"
    # no decisive category (e.g. uncategorized) -> fall back to the title
    if TRAIN_TITLE.search(title or ""):
        return "training"
    if EVENT_TITLE.search(title or ""):
        return "events"
    return "general"


# --- event-date detection -------------------------------------------------
# Titles carry the real session date (e.g. "8-14 February 2027",
# "December 5 & 6", "28 & 29 Νοεμβρίου"). We parse it so the app can tell an
# *upcoming* seminar/event apart from an old post whose publish date is in the
# past (a seminar announced months before it happens).
_MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5,
    "june": 6, "july": 7, "august": 8, "september": 9, "october": 10,
    "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7,
    "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "ιανουαρίου": 1, "ιανουάριος": 1, "ιαν": 1,
    "φεβρουαρίου": 2, "φεβρουάριος": 2, "φεβ": 2,
    "μαρτίου": 3, "μάρτιος": 3, "μαρ": 3,
    "απριλίου": 4, "απρίλιος": 4, "απρ": 4,
    "μαΐου": 5, "μάιος": 5, "μαϊ": 5, "μαη": 5,
    "ιουνίου": 6, "ιούνιος": 6, "ιουν": 6,
    "ιουλίου": 7, "ιούλιος": 7, "ιουλ": 7,
    "αυγούστου": 8, "αύγουστος": 8, "αυγ": 8,
    "σεπτεμβρίου": 9, "σεπτέμβριος": 9, "σεπτ": 9, "σεπ": 9,
    "οκτωβρίου": 10, "οκτώβριος": 10, "οκτ": 10,
    "νοεμβρίου": 11, "νοέμβριος": 11, "νοεμ": 11, "νοε": 11,
    "δεκεμβρίου": 12, "δεκέμβριος": 12, "δεκ": 12,
}
_MONTH_ALT = "|".join(sorted(_MONTHS.keys(), key=len, reverse=True))
_SEP = r"(?:[-–—&]|\s|και|to|έως)*"
# day(s) then month: "8-14 February 2027", "28 & 29 Νοεμβρίου", "19 September"
_DMY = re.compile(
    r"(\d{1,2})(?!\d)\s*" + _SEP + r"\s*(\d{1,2})?(?!\d)\s*(" + _MONTH_ALT + r")\.?\s*(\d{4})?"
)
# month then day(s): "December 5 & 6", "October 25 & 26 2025"
_MDY = re.compile(
    r"(" + _MONTH_ALT + r")\.?\s*(\d{1,2})(?!\d)\s*" + _SEP + r"\s*(\d{1,2})?(?!\d)\s*(\d{4})?"
)


def _mk_date(year: int, month: int, day: int) -> Optional[date]:
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _event_dates(title: str, pub_iso: str) -> tuple[Optional[str], Optional[str]]:
    low = (title or "").lower()
    dmy = _DMY.search(low)
    mdy = _MDY.search(low)

    def unpack(m, order: str):
        if order == "dmy":
            d1, d2, mon, yr = m.group(1), m.group(2), m.group(3), m.group(4)
        else:
            mon, d1, d2, yr = m.group(1), m.group(2), m.group(3), m.group(4)
        month = _MONTHS.get(mon)
        if not month:
            return None
        day1 = int(d1)
        day2 = int(d2) if d2 else day1
        if not (1 <= day1 <= 31):
            return None
        return {"d1": day1, "d2": day2 if day2 >= day1 else day1,
                "month": month, "year": int(yr) if yr else None,
                "range": bool(d2), "pos": m.start()}

    cands = []
    if dmy:
        c = unpack(dmy, "dmy")
        if c:
            cands.append(c)
    if mdy:
        c = unpack(mdy, "mdy")
        if c:
            cands.append(c)
    if not cands:
        return None, None

    # Prefer a day-range (real events list "5 & 6"), then an explicit year,
    # then the earliest match in the title.
    cands.sort(key=lambda c: (not c["range"], c["year"] is None, c["pos"]))
    best = cands[0]
    month, day1, day2 = best["month"], best["d1"], best["d2"]
    year = best["year"]

    if year is None:
        pub = None
        try:
            pub = date.fromisoformat((pub_iso or "")[:10])
        except ValueError:
            pub = None
        base_year = pub.year if pub else datetime.now().year
        year = base_year
        cand = _mk_date(year, month, day1)
        # Event listed clearly before the publish date → it's next year.
        if cand and pub and (pub - cand).days > 60:
            year = base_year + 1

    if year < 2024 or year > datetime.now().year + 3:
        return None, None

    start = _mk_date(year, month, day1)
    if not start:
        return None, None
    end = _mk_date(year, month, day2) or start
    return start.isoformat(), end.isoformat()


# --- html -> blocks -------------------------------------------------------
SHORTCODE = re.compile(r"\[/?[a-zA-Z][^\]]*\]")


def _clean(text: str) -> str:
    text = SHORTCODE.sub("", text or "")
    text = html.unescape(text)
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    return text.strip()


def _abs(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    return urljoin(BASE, url)


def _img_src(img) -> Optional[str]:
    for attr in ("data-src", "data-lazy-src", "src"):
        v = img.get(attr)
        if v and not v.startswith("data:"):
            return _abs(v)
    return None


def _walk(node, blocks: list):
    for child in getattr(node, "children", []):
        name = getattr(child, "name", None)
        if not name:
            continue
        if name in ("div", "section", "article", "span", "a"):
            _walk(child, blocks)
        elif name in ("h1", "h2", "h3", "h4"):
            t = _clean(child.get_text(" "))
            if t:
                blocks.append({"type": "heading", "text": t})
        elif name == "p":
            img = child.find("img")
            t = _clean(child.get_text(" "))
            if img and not t:
                src = _img_src(img)
                if src:
                    blocks.append({"type": "image", "src": src,
                                   "alt": _clean(img.get("alt", ""))})
            elif t:
                blocks.append({"type": "paragraph", "text": t})
        elif name in ("ul", "ol"):
            items = [_clean(li.get_text(" ")) for li in child.find_all("li")]
            items = [i for i in items if i]
            if items:
                blocks.append({"type": "list", "items": items})
        elif name == "blockquote":
            t = _clean(child.get_text(" "))
            if t:
                blocks.append({"type": "quote", "text": t})
        elif name == "figure":
            img = child.find("img")
            if img:
                src = _img_src(img)
                if src:
                    blocks.append({"type": "image", "src": src,
                                   "alt": _clean(img.get("alt", ""))})
        elif name == "img":
            src = _img_src(child)
            if src:
                blocks.append({"type": "image", "src": src,
                               "alt": _clean(child.get("alt", ""))})


def _to_blocks(content_html: str, hero: Optional[str]) -> list:
    soup = BeautifulSoup(content_html or "", "html.parser")
    for tag in soup(["script", "style", "iframe", "noscript"]):
        tag.decompose()
    raw: list = []
    _walk(soup, raw)
    # de-duplicate consecutive identical images and drop the hero if repeated
    blocks: list = []
    seen_img = {hero} if hero else set()
    for b in raw:
        if b["type"] == "image":
            if b["src"] in seen_img:
                continue
            seen_img.add(b["src"])
        if (blocks and blocks[-1].get("type") == b.get("type")
                and b.get("text") and blocks[-1].get("text") == b.get("text")):
            continue
        blocks.append(b)
    return blocks


def _featured(post: dict) -> Optional[str]:
    media = (post.get("_embedded", {}) or {}).get("wp:featuredmedia") or []
    if not media:
        return None
    m = media[0]
    sizes = ((m.get("media_details") or {}).get("sizes") or {})
    for key in ("medium_large", "large", "medium", "full"):
        if key in sizes and sizes[key].get("source_url"):
            return sizes[key]["source_url"]
    return m.get("source_url")


_SKIP_IMG = re.compile(
    r"(accredited|logo|badge|seal|sprite|icon|iphm|placeholder|avatar|favicon|spacer|pixel)",
    re.IGNORECASE,
)


def _first_content_image(post: dict) -> Optional[str]:
    """Fallback hero: first real <img> inside the post body when there is no
    featured image. Skips logos/badges (e.g. accreditation seals) so cards
    show an actual seminar photo."""
    html_body = (post.get("content") or {}).get("rendered", "")
    if not html_body:
        return None
    soup = BeautifulSoup(html_body, "html.parser")
    for img in soup.find_all("img"):
        src = _img_src(img)
        if src and not _SKIP_IMG.search(src):
            return src
    return None


def _categories(post: dict) -> list[dict]:
    terms = (post.get("_embedded", {}) or {}).get("wp:term") or []
    out = []
    for group in terms:
        for t in group:
            if t.get("taxonomy") == "category":
                out.append({"name": t.get("name"), "slug": t.get("slug")})
    return out


def _process(post: dict) -> dict:
    title = _clean((post.get("title") or {}).get("rendered", ""))
    excerpt = _clean(
        BeautifulSoup((post.get("excerpt") or {}).get("rendered", ""),
                      "html.parser").get_text(" ")
    )
    excerpt = re.sub(r"\s*\[.*$", "", excerpt)  # drop trailing "[…]" / "[…] →"
    hero = _featured(post) or _first_content_image(post)
    cats = _categories(post)
    pub_date = (post.get("date") or "")[:10]
    event_start, event_end = _event_dates(title, pub_date)
    return {
        "id": post.get("id"),
        "slug": post.get("slug"),
        "title": title,
        "excerpt": excerpt,
        "date": pub_date,
        "event_start": event_start,
        "event_end": event_end,
        "image": hero,
        "link": post.get("link"),
        "category": _classify(cats, title),
        "categories": [c["name"] for c in cats if c.get("name")],
        "content_html": (post.get("content") or {}).get("rendered", ""),
    }


async def _fetch_posts() -> list[dict]:
    now = time.time()
    if _CACHE["posts"] and (now - _CACHE["ts"] < TTL):
        return _CACHE["posts"]
    try:
        async with httpx.AsyncClient(
            timeout=20, headers={"User-Agent": UA}, follow_redirects=True
        ) as client:
            resp = await client.get(
                f"{WP_API}/posts",
                params={"per_page": PER_PAGE, "_embed": "1", "status": "publish"},
            )
            resp.raise_for_status()
            posts = [_process(p) for p in resp.json()]
        _CACHE["posts"] = posts
        _CACHE["ts"] = now
        return posts
    except Exception as exc:  # network / parse failure -> serve stale if any
        logger.warning("blog fetch failed: %s", exc)
        if _CACHE["posts"]:
            return _CACHE["posts"]
        return []


def build_blog_router() -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/blog")
    async def list_blog(section: str = "all"):
        posts = await _fetch_posts()

        def meta(p: dict) -> dict:
            return {k: v for k, v in p.items() if k != "content_html"}

        if section in ("training", "events"):
            relevant = [meta(p) for p in posts if p["category"] == section]
            general = [meta(p) for p in posts if p["category"] == "general"]
            return relevant + general[:6]
        return [meta(p) for p in posts]

    @router.get("/blog/{post_id}")
    async def get_blog(post_id: int):
        posts = await _fetch_posts()
        post = next((p for p in posts if p["id"] == post_id), None)
        if not post:
            raise HTTPException(status_code=404, detail="Το άρθρο δεν βρέθηκε.")
        return {
            "id": post["id"],
            "title": post["title"],
            "date": post["date"],
            "image": post["image"],
            "link": post["link"],
            "category": post["category"],
            "categories": post["categories"],
            "event_start": post.get("event_start"),
            "event_end": post.get("event_end"),
            "blocks": _to_blocks(post["content_html"], post["image"]),
        }

    return router
