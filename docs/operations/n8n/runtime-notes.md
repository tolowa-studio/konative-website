# Runtime notes from 2026-06-18 activation

The live n8n workflow named `Konative website intake → Twenty CRM` is published
in the Personal project and the production webhook is active at
`/webhook/konative-intake`.

Runtime fixes applied in the n8n editor during activation:

- Use `TWENTY_API_TOKEN` from Railway.
- n8n Code nodes in this instance do not expose global `fetch`; the live node
  uses Node `https.request`.
- The private Twenty endpoint required `rejectUnauthorized: false` from the
  Code node runtime.
- Twenty opportunity `lane` enum values are `TRIBAL`, `DATACENTER`, and
  `GENERAL`.
- This Twenty workspace opportunity object does not expose `notes`.
- This Twenty workspace task object does not expose `body`.

Production smoke test passed with a synthetic payload on 2026-06-18 and returned
company, person, opportunity, and task IDs. The synthetic records are clearly
named `Konative Production Automation Test` / `Konative Production Intake Test`
and can be deleted after review.
