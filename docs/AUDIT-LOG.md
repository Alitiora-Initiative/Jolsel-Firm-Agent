# Jolsel Firm — Audit Log

Audit date: 2026-11-05
Repository: https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent
Audited commit: `e9723ef9de74037cfaa7ecdd51ee378ace53e207` (`origin/main`)
Auditor: Project Partner (OpenBot channel "Project SL")
Method: source read, git history, GitHub Actions API, live HTTP checks, local toolchain run.

This log records findings, evidence, and status. It is not a pass certificate. A finding is
closed only when the fix is on `main` and the evidence link is replaced with the verifying run.

## Severity

| Level | Meaning |
| --- | --- |
| Blocker | Prevents a shippable build, or the claim cannot be true as written |
| High | Real money, key handling, or user-visible false data |
| Medium | Wrong or stale behaviour without direct fund risk |
| Low | Hygiene, docs, or reproducibility |

## Findings

### A-01 — Blocker — CI has never passed; install step fails before any code runs

Evidence: every GitHub Actions run for this repo concludes `failure`
(`https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent/actions`). In run
`41460348729` (commit `e9723ef`) the job `validate` fails at **Setup Node.js**;
Install, Lint, Typecheck, and Build are all skipped.

Cause: `.github/workflows/ci.yml` sets `actions/setup-node` `cache: npm` and then runs
`npm ci`. Both require a committed `package-lock.json`, and the repository has none
(`.gitignore` does not ignore it; it was simply never committed).

Impact: "checks pass with zero errors" is currently impossible, and every push is red
regardless of code quality.

Fix: commit `package-lock.json` generated from the committed `package.json`.
Status: fixed in this branch — see `package-lock.json`; verification pending on the next run.

### A-02 — Blocker — `next lint` cannot run non-interactively

Evidence: the repository has no `.eslintrc*` / `eslint.config.*`. `next lint` in a
non-TTY environment (CI) aborts asking to create a config.

Impact: even after A-01, the Lint step fails.

Fix: add `.eslintrc.json` extending `next/core-web-vitals`.
Status: fixed in this branch.

### A-03 — High — Self-learning modules exist but nothing imports them

Evidence: `src/lib/agents/learning.ts`, `src/lib/profile.ts`, and `src/lib/risk.ts` are
present on `origin/main`, but a repository-wide search finds no import of
`loadLearning`, `recordDecision`, `getAdjustedScoreBias`, `loadRules`, `saveRules`, or
`evaluateRisk` outside their own files.

Impact: "agents self-learn after every execution" is not implemented. The modules are
also browser-only (`localStorage`), so they cannot learn inside the server-side engine or
on Vercel functions.

Fix (design): a persisted outcome store written by the engine after a real fill or a
resolved signal, read back into `scoring.ts` as a bounded adjustment. No invented wins.
Status: open.

### A-04 — High — No Agent 18, and no scanner that feeds the pipeline

Evidence: `src/lib/agents/` contains 17 agent classes in five departments; `engine.ts`
runs exactly those. No scanner, candidate queue, or discovery agent beyond
`Bscoter.scout`.

Impact: the requested Agent 18 does not exist.

Fix (design): Agent 18 is a bounded discovery agent. It polls DexScreener
token-profiles/boosts/search on a fixed interval, applies hard pre-filters (Solana chain,
mint present, liquidity and 24h volume floors, pair age), and emits at most one candidate
per cycle to the existing 17-agent scoring path. A literal 10,000 tokens/second scan is
not possible against public APIs and must not be claimed.
Status: open.

### A-05 — High — README advertises a private-key environment variable

Evidence: `README.md` "Environment Setup" lists
`AI_HOT_WALLET_PRIVATE_KEY=your_private_key_here` under "AI Hot Wallet (for autonomous
trading - COMING SOON)".

Impact: contradicts the self-custody model stated later in the same README and invites a
user to paste a key into an env file. No code reads this variable.

Fix: remove the variable and the "coming soon" hot-wallet block; state that the server
never holds a key.
Status: open.

### A-06 — Blocker for live verification — the live URL is not this application

Evidence: `https://jolsel-firm.vercel.app/` serves a Vite bundle
(`/assets/index-*.js`, `/assets/Panels-*.js`) with a `__grok` web manifest and routes
`/`, `/core`, `/terminal`, `/vault`, `/treasury`, `/coin`, `/profile`, `/tech`,
`/reviews`, `/agents`, `/ledger`. This repository is Next.js 14 and its routes are
`/`, `/core`, `/dashboard`, `/treasury`, `/whitepaper`; its API routes
(`/api/dex/*`, `/api/firm/run`, `/api/price/sol`) return 404 on the live host.

Impact: a push to this repo cannot be verified on that URL. "Deployed site serves the
pushed commit" is unverifiable until the Vercel project is pointed at this repository.

Access note: the Vercel API returns `403 forbidden` for team scope `jolse`
(`team_Mlpz0l6o2HlH9tE8hetluFH3`); team authorization is required before the project
link and deployment can be inspected or changed.
Status: open — needs operator action (Vercel team authorization or project relink).

### A-07 — Medium — Mainnet RPC is documented but only wired for the browser

Evidence: `.env.example` defines `SOLANA_RPC_MAINNET`, `SOLANA_RPC_URL`, and
`NEXT_PUBLIC_SOLANA_RPC`. No file under `src/` reads `SOLANA_RPC_MAINNET` or
`SOLANA_RPC_URL`. The only RPC selection is
`src/providers/WalletProvider.tsx`, which defaults to `clusterApiUrl("mainnet-beta")`.
No server route constructs a `Connection`.

Impact: client wallet reads are mainnet; server-side reads and any server pipeline have no
RPC. "RPC changed to mainnet" is true for the browser only.

Fix: one server RPC helper (`src/lib/solana.ts`) that reads `SOLANA_RPC_MAINNET` then
`SOLANA_RPC_URL` then the public mainnet endpoint, never logs the URL, and is used by
read-only server routes.
Status: open.

### A-08 — Medium — Trade ledger is process memory only

Evidence: `src/lib/agents/audit/ledger.ts` keeps a 100-entry array in module scope and
labels itself "not a durable or financial ledger".

Impact: the terminal's ledger and approval-rate figures reset on every cold start and
differ per instance. They must not be presented as history.
Status: open (documented limitation; UI copy must match).

### A-09 — Medium — No automated tests in the repository

Evidence: the committed `package.json` has no `test` script and no test runner; the CI
workflow runs lint, typecheck, and build only. The working tree that was stashed on
2026-11-05 contained `scoring.test.ts`, `jupiter.test.ts`, and vitest, but those were
never committed.

Impact: "tests pass" currently means "nothing is tested".
Status: open — adopt the stashed tests after review.

### A-10 — Low — Documentation references a missing file

Evidence: `PLAN.md` §7 says "see `docs/MAINNET-MIGRATION-GUIDE.md`"; `docs/` does not
exist in the repository.

Impact: broken reference.
Status: open.

## Verified during this audit

- `origin/main` head: `e9723ef` (2026-11-02). The shared local clone was 22 commits
  behind and carried a divergent working tree; that tree was stashed as
  `wip: local divergence vs origin/main (2026-11-05)` before fast-forwarding, so no work
  was discarded.
- Repository contains 17 agent classes, 8 API routes, 4 page routes.
- Live `https://jolsel-firm.vercel.app/` returns 200 and is the different app described
  in A-06.
- `package-lock.json` generated from the committed `package.json`; `npm ci` is the CI
  install path.

## Not audited

- On-chain program (`Anchor.toml`, program IDs) — no program change was made here.
- Jupiter swap execution and wallet signing paths — user-signed by design.
- Vercel project settings and deployment history — blocked by team authorization (A-06).
- Dependency vulnerabilities — `npm audit` was not run as part of this pass.

## Change log

| Date | Commit | Change |
| --- | --- | --- |
| 2026-11-05 | pending | Added `package-lock.json` and `.eslintrc.json`; opened this log. |
