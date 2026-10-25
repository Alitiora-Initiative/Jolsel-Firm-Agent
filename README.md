# Jolsel Firm

Live Solana desk. Seventeen agents read the public memecoin tape. You sign every swap.

## What is on mainnet

- Homepage leaderboard and the core both use the DexScreener Solana tape. Empty when the feed is empty.
- Treasury and profile read `EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz` and the connected wallet through a mainnet RPC. The chart is samples of that balance taken in the browser. It is not a simulated fee series.
- Jupiter quotes on the terminal are real quotes. Nothing here broadcasts a swap.
- Wallet connect uses Phantom or Solflare in the browser.

## What is not on mainnet

The vault program in `programs/jolsel-vault` is Rust. It is not deployed, so the site will not take a deposit.

Instructions:

| Tag | Name | Who signs | Effect |
| --- | --- | --- | --- |
| 0 | initialize | dev authority | Creates the config PDA. Cap cannot exceed 100,000 SOL. |
| 1 | open_vault | depositor | Pays the fee (at least the on-chain floor) to the treasury address, then creates that wallet's vault PDA. |
| 2 | deposit | depositor | Moves SOL into their own vault, under the cap. |
| 3 | withdraw | depositor | Returns SOL to the same wallet. |
| 4 | set_min_fee | dev authority | Raises or lowers the open-fee floor. Cannot touch deposits. |

There is no instruction that lets the firm move a user's SOL. A Solidity file is not included: this chain does not run the EVM.

JOLSEL FIRM (200,000,000) is a written allocation, not a mint. The coin page stays locked unless the dev wallet is connected. Other wallets cannot open it. A pasted mint is checked with `getAccountInfo` and is stored only in that browser until a mint is actually deployed.

Jolsel Interest Pay, the airdrop, and the 600 SOL launch split are written rules. They do not pay anyone while the program and the mint are absent. The 600 SOL guide appears only when that treasury address holds at least 1,000 SOL and the dev wallet is connected.

## Pages

Home, Core, Terminal, Vault, Treasury, Coin, Profile, Tech, Reviews, Desks, Ledger.

The tech page runs live HTTP checks. It does not claim the site cannot be breached. Reviews that are too short, or that ask for a drain or a seed phrase, are refused. Accepted notes open a GitHub issue so the dev wallet can read them. There is no private inbox.

## Dev

```bash
npm install
npm run dev
```

Preview listens on port 8080. `npm run build` must pass before a deploy.

The vault crate typechecks on its own:

```bash
cargo test --manifest-path programs/jolsel-vault/Cargo.toml
```

Do not commit `.vercel/output`. If that directory is in the repo, Vercel ships the stale prebuild and skips the source build.
