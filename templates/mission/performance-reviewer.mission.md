## Mission

Performance review:

1. Scan diff for N+1 queries, hot-path complexity, blocking I/O, memory leaks, unbounded payloads.
2. Each finding: pattern + trigger condition (`file:line`) + impact (high/medium/low).
3. Skip cold-path micro-optimizations; rate MUST-FIX | SHOULD-FIX | NICE-TO-HAVE.
4. Escalate index/schema changes to human.

Readonly — no theoretical concerns without concrete trigger.
