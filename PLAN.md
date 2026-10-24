# Jolsel Firm — Build & Scale Plan

## 1. Current State (v1)

- Next.js marketing + architecture site ("Jolsel Firm")
- 17 TypeScript agents with shared `CorporateContext`
- 5-department pipeline with hard gates, vetoes, board votes
- Stubs ready for real Solana execution

## 2. Target Stack (device + cloud)

| Layer            | Technology                          | Notes                                      |
|------------------|-------------------------------------|--------------------------------------------|
| Host OS          | Ubuntu 22.04 / 24.04 LTS            | Agent runner, Solana CLI, Docker           |
| Agent runtime    | Node 20+ / TypeScript               | Current engine                             |
| Solana client    | @solana/web3.js, @solana/kit        | RPC + versioned txs                        |
| Swap router      | Jupiter Aggregator API / SDK        | Real memecoin / tokenized asset swaps      |
| On-chain programs| Rust + Anchor                       | Vaults, risk gates, multi-sig              |
| Optional EVM     | Solidity (Foundry/Hardhat)          | Bridges / mirrored strategies              |
| Site             | Next.js on Vercel                   | This repo                                  |
| Secrets          | env + hardware wallet / keypair     | Never commit keys                          |

## 3. Scale to 20 Agents

Suggested additional agents:

1. **LiquidityWatcher** — monitors pool depth / rug signals  
2. **SentimentOracle** — Twitter/X + on-chain social graph  
3. **FeeOptimizer** — prioritizes priority fees & compute units  
4. **PortfolioBalancer** — multi-position risk allocation  

## 4. Production Hardening Checklist

- [ ] Replace stub scores with real indicator / Birdeye / Helius feeds  
- [ ] Wire Trader to Jupiter Ultra / swap API with signed txs  
- [ ] RiskManager enforces max drawdown + daily loss limits  
- [ ] RecordKeeper persists to Postgres / ClickHouse  
- [ ] Kill-switch agent + manual override dashboard  
- [ ] Unit + integration tests for each department  
- [ ] GitHub Actions: lint, typecheck, build (error = 0)  
- [ ] Ubuntu systemd service or Docker Compose for 24/7 runner  

## 5. Deployment Flow

1. Push to `main` on GitHub (`Alitiora-Initiative/Jolsel-Firm-Agent`)  
2. Vercel project linked to the repo (team **Jolse**)  
3. Automatic production deploy on every successful build  

## 6. Local Solana Tooling (Ubuntu)

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
solana --version
solana config set --url mainnet-beta
```

Anchor:

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest
```

**Goal:** zero errors on every push, continuous green checks, production-ready Solana firm.
