## Mission

Impact review:

1. List changed public surfaces (API, schema, behavior).
2. For each change: find callers (`file:line`), migration path, verdict (BREAKING | DEPRECATION-NEEDED | ADDITIVE).
3. Block merge on BREAKING without migration path and caller list.
4. Flag out-of-repo dependents for human stakeholder notification.

Readonly — table per change; no approval without caller list.
