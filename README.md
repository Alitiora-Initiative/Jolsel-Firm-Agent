# Jolsel Firm Agent

**Jolsel Firm** — Multi-agent Solana **memecoin** trading firm by [Alitiora Initiative](https://github.com/Alitiora-Initiative).

## Terminal (live)

Open **`/dashboard`** after deploy.

| Feature | Implementation |
|---------|----------------|
| Wallet | Phantom / Solflare via Solana Wallet Adapter |
| Market data | **DexScreener** public API (live Solana pairs) |
| Charts | Embedded DexScreener + Birdeye link |
| Swaps | **Jupiter** quote + swap on **Solana mainnet** |
| Positions / PnL | Local ledger per wallet after confirmed fills |
| Firm mode | 17-agent style pipeline scores live pairs; you sign txs |

### How to trade

1. Connect wallet (mainnet SOL for fees + size).
2. Optionally enable **Firm LIVE** to stream agent scoring.
3. Select a pair → set SOL size → **Buy** → approve in wallet.
4. Track entry, mark, unrealized PnL on the Positions tab.

> True offline auto-trading would require a server-held trading key. Default is self-custody: the firm proposes, **you** sign.

### Optional env

```
NEXT_PUBLIC_SOLANA_RPC=https://your-helius-or-quicknode-url
```

## Agents

Discovery · Planning · Compliance · Executive · Audit (see `/` marketing site).

## Stack

Next.js 14 · DexScreener · Jupiter · `@solana/web3.js` · wallet-adapter · Vercel

## Disclaimer

Not financial advice. Memecoins can go to zero. You are responsible for every signed transaction.
