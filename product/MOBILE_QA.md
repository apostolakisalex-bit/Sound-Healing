# Mobile QA — 2026-10-02

Status: code audit and TypeScript passed. Multi-viewport visual QA is NOT completed: browser tool refused localhost access under its security policy. No browser bypass attempted.

Changes: shared screen respects left/right/top/bottom safe-area insets; iOS keyboard avoidance and scroll keyboard insets; home notification controls clear the top inset; training cards stack below 350 logical pixels or large font scale; mosaic cards may grow with large system text; service cards use two mobile columns.

Pending visual/device matrix: 320x568, 360x800, 375x667, 390x844, 412x915, 430x932, 844x390. Check home, training, login/register, student profile/practice forms and admin content/media. Check no horizontal overflow or clipped labels, last fields above keyboard, fixed navigation, notch/home indicator and 150–200% text. Actual iOS Safari/native and Android Chrome/native remain unverified.
