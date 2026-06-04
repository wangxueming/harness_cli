## Mission

CI failure investigation:

1. Identify the exact failing check, command, log line, and error message.
2. Reproduce locally; distinguish flaky (infra/timing) vs genuine regression.
3. Propose a minimal fix — change only what is needed to pass the check.
4. Never suggest `--no-verify` or skip flags unless the check itself is broken.

Escalate infra failures to human + ops; architectural fixes → orchestrator.
