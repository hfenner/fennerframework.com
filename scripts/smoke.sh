#!/usr/bin/env bash
# Smoke test a running copy of the site.
# Usage: scripts/smoke.sh <base-url> [expected-commit-sha]
#   SMOKE_WRITE=1  also POST a test lead to /api/contact (local dev / preview only — never production)
set -euo pipefail
BASE=${1:?base url}; WANT=${2:-}
fail() { echo "✗ $*" >&2; exit 1; }
ok() { echo "✓ $*"; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

PAGE=$(curl -sS -L "$BASE/")
[ "$(code "$BASE/")" = "200" ] || fail "GET / should be 200"
for id in services process about contact lead-form; do grep -q "id=\"$id\"" <<<"$PAGE" || fail "page missing #$id"; done
grep -q 'Fenner Framework' <<<"$PAGE" || fail "page missing brand"
ok "home page renders"

[ "$(code "$BASE/styles.css")" = "200" ] || fail "styles.css"
[ "$(code "$BASE/app.js")" = "200" ] || fail "app.js"
[ "$(code "$BASE/favicon.svg")" = "200" ] || fail "favicon.svg"
[ "$(code "$BASE/og.png")" = "200" ] || fail "og.png"
[ "$(code "$BASE/robots.txt")" = "200" ] || fail "robots.txt"
[ "$(code "$BASE/sitemap.xml")" = "200" ] || fail "sitemap.xml"
[ "$(code "$BASE/definitely-not-a-page")" = "404" ] || fail "unknown path should 404"
ok "static assets + 404"

[ "$(code "$BASE/api/contact")" = "405" ] || fail "GET /api/contact should 405"
[ "$(code -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"name":"","message":""}')" = "400" ] || fail "empty POST should 400"
[ "$(code -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"name":"Bot","message":"spam spam spam spam","email":"a@b.co","company":"x"}')" = "200" ] || fail "honeypot should fake 200"
ok "contact API contract"

if [ -n "$WANT" ]; then
  GOT=$(curl -s "$BASE/version.json" | sed -n 's/.*"commit": *"\([^"]*\)".*/\1/p')
  [ "$GOT" = "$WANT" ] || fail "live commit '$GOT' != expected '$WANT'"
  ok "live commit matches $WANT"
fi

if [ "${SMOKE_WRITE:-0}" = "1" ]; then
  curl -s -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -H 'Accept: application/json' \
    -d '{"name":"Smoke Test","email":"smoke@example.invalid","project":"Deck or porch","message":"CI smoke test lead — safe to delete."}' | grep -q '"ok":true' || fail "POST lead round-trip"
  [ "$(code -X POST "$BASE/api/contact" --data-urlencode 'name=Smoke Form' --data-urlencode 'phone=000' --data-urlencode 'message=form-encoded smoke test lead')" = "303" ] || fail "form POST should 303 redirect"
  ok "lead write round-trip"
fi
echo "smoke OK"
