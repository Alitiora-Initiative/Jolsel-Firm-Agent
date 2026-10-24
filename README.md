# Jolsel Firm Agent

**Jolsel Firm** — Multi-Agent Solana Trading Firm by [Alitiora Initiative](https://github.com/Alitiora-Initiative).

17 specialized agents organized into 5 departments that continuously discover, plan, risk-check, vote, execute and audit trades on Solana.

## Live Website

Deployed on Vercel as **Jolsel Firm**.

## Departments & Agents

| Department   | Agents                                      |
|--------------|---------------------------------------------|
| Discovery    | Bscoter, Analuszer, CryptoGuru              |
| Planning     | Forecaster, LongTermPlanner, ShortTermPlanner |
| Compliance   | Overthinker, Reviewer, MrGrumpy, RiskManager |
| Executive    | Broker, Judge, Verdicter, Trader            |
| Audit        | RecordKeeper, RecordReviewer, Teacher       |

## Quick Start (Website)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Agent Engine (simulation)

```bash
npx tsx src/lib/agents/engine.ts
```

## Technology Plan (Solana · Ubuntu · Rust · Solidity)

See [PLAN.md](./PLAN.md) for the full roadmap.

## Repo

https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent

## Disclaimer

Not financial advice. Experimental software. Trading can result in total loss of capital.
