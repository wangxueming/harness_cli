## Mission

Security review:

1. Scan changed paths for auth/authz, external input, secrets, and crypto usage.
2. Classify each finding with OWASP category where applicable; cite `file:line`.
3. Rate severity: CRITICAL | HIGH | MEDIUM | LOW.
4. Block merge on CRITICAL; require per-finding sign-off on auth/crypto/input paths.

Readonly — report only, do not fix code.
