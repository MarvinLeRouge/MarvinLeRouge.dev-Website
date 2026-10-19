#!/usr/bin/env bash
# Smoke test of the production image: status codes, security headers, caching and compression.
# Usage: scripts/smoke-docker.sh <base-url>, e.g. http://localhost:8080
set -euo pipefail

base_url="${1:?usage: smoke-docker.sh <base-url>}"
failures=0

fail() {
  echo "FAIL: $*" >&2
  failures=$((failures + 1))
}

# Prints the response headers of a GET request, without carriage returns.
# Header names are matched case-insensitively by expect_header.
headers_of() {
  curl -sS -o /dev/null -D - "$@" | tr -d '\r'
}

expect_status() {
  local path="$1" expected="$2" actual
  actual="$(curl -sS -o /dev/null -w '%{http_code}' "$base_url$path")"
  [[ "$actual" == "$expected" ]] || fail "$path answered $actual, expected $expected"
}

expect_header() {
  local headers="$1" label="$2" pattern="$3"
  grep -qiE "$pattern" <<<"$headers" || fail "$label: missing header matching '$pattern'"
}

expect_security_headers() {
  local headers="$1" label="$2"
  expect_header "$headers" "$label" "^content-security-policy: default-src 'self'"
  expect_header "$headers" "$label" '^strict-transport-security: max-age='
  expect_header "$headers" "$label" '^x-content-type-options: nosniff'
  expect_header "$headers" "$label" '^referrer-policy: '
  expect_header "$headers" "$label" '^permissions-policy: '
}

expect_status / 200
home_headers="$(headers_of "$base_url/")"
expect_security_headers "$home_headers" /
expect_header "$home_headers" / '^cache-control: no-cache'

expect_status /does-not-exist/ 404
# The e2e fixture sheet is only built for the tests, never in the production image.
expect_status /projets/e2e-fixture/ 404
not_found_body="$(curl -sS "$base_url/does-not-exist/")"
grep -q 'Sector not found' <<<"$not_found_body" || fail '404 page not served'
expect_security_headers "$(headers_of "$base_url/does-not-exist/")" /does-not-exist/

home_body="$(curl -sS "$base_url/")"
stylesheet="$(grep -oE -m 1 '/_astro/[^"]+\.css' <<<"$home_body" || true)"
if [[ -z "$stylesheet" ]]; then
  fail 'no /_astro/ stylesheet linked from the homepage'
else
  asset_headers="$(headers_of -H 'Accept-Encoding: gzip' "$base_url$stylesheet")"
  expect_header "$asset_headers" "$stylesheet" '^cache-control: .*immutable'
  expect_header "$asset_headers" "$stylesheet" '^content-encoding: gzip'
  expect_security_headers "$asset_headers" "$stylesheet"
fi

if ((failures > 0)); then
  echo "$failures check(s) failed" >&2
  exit 1
fi
echo 'All smoke checks passed'
