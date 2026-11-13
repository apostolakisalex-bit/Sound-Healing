"""Tiny in-process sliding-window rate limiter for auth / abuse-sensitive routes.

Single-instance design (one Uvicorn worker). Two independent buckets are used on
auth endpoints — client IP and normalized email — so neither one-account nor
credential-stuffing attacks slip through. Returns HTTP 429 + Retry-After.
"""
from __future__ import annotations

import hashlib
import hmac
import os
import threading
import time
from collections import deque
from math import ceil

from fastapi import HTTPException, Request

_events: dict[str, deque] = {}
_lock = threading.Lock()
_TOO_MANY = "Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε λίγο."


def _secret() -> bytes:
    return os.environ.get("JWT_SECRET", "shg-ratelimit").encode()


def _check(reqs) -> int:
    """reqs: iterable of (key, limit, window). Return retry-after secs, or 0 if allowed."""
    now = time.monotonic()
    with _lock:
        prepared = []
        for key, limit, window in reqs:
            q = _events.setdefault(key, deque())
            cutoff = now - window
            while q and q[0] <= cutoff:
                q.popleft()
            prepared.append((q, limit, window))
        blocked = [(q[0], window) for q, limit, window in prepared if len(q) >= limit]
        if blocked:
            return max(1, max(ceil(window - (now - oldest)) for oldest, window in blocked))
        for q, _, _ in prepared:
            q.append(now)
        return 0


def client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    xr = request.headers.get("x-real-ip")
    if xr:
        return xr.strip()
    return request.client.host if request.client else "unknown"


def _email_key(email: str) -> str:
    normalized = (email or "").strip().casefold().encode()
    return "e:" + hmac.new(_secret(), normalized, hashlib.sha256).hexdigest()


def _reject(retry: int):
    raise HTTPException(status_code=429, detail=_TOO_MANY, headers={"Retry-After": str(retry)})


def limit_auth(request: Request, email: str, ip_rule: tuple, email_rule: tuple):
    """ip_rule / email_rule = (limit, window_seconds)."""
    retry = _check([
        ("ip:" + client_ip(request), ip_rule[0], ip_rule[1]),
        (_email_key(email), email_rule[0], email_rule[1]),
    ])
    if retry:
        _reject(retry)


def limit_key(key: str, limit: int, window: int):
    retry = _check([(key, limit, window)])
    if retry:
        _reject(retry)
