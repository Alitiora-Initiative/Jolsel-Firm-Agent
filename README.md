# Jolsel Firm Agent

**Jolsel Firm** — Production-grade Multi-agent Solana **memecoin** trading firm by [Alitiora Initiative](https://github.com/Alitiora-Initiative).

## 🚀 Live Deployment

- **Dashboard**: `/dashboard` - Real-time trading terminal with 17-agent scoring pipeline
- **Treasury**: `/treasury` - On-chain vault management with performance analytics
- **Marketing**: `/` - Architecture overview and team information

## ⚡ Features

| Feature | Implementation |
|---------|----------------|
| **Real-time Updates** | 1-second refresh rate for all data streams |
| **Wallet Integration** | Phantom / Solflare via Solana Wallet Adapter |
| **Market Data** | DexScreener public API (live Solana pairs) |
| **Charts** | Embedded DexScreener + Birdeye live charts |
| **Swaps** | Jupiter quote + swap on Solana mainnet |
| **Positions / PnL** | Local ledger per wallet after confirmed fills |
| **Long/Short Analysis** | AI agents perform momentum-based direction analysis |
| **Unlimited Events** | No message cap on agent communication stream |
| **Firm Mode** | 17-agent pipeline scores live pairs; you sign transactions |

## 📊 How to Trade

1. Connect wallet (mainnet SOL for fees + size)
2. Optionally enable **Firm LIVE** to stream agent scoring with LONG/SHORT calls
3. Select a pair → set SOL size → **Buy** → approve in wallet
4. Track entry, mark, unrealized PnL on the Positions tab
5. Monitor treasury performance on `/treasury`

> **Self-Custody Model**: The firm proposes, **you** sign. True offline auto-trading would require a server-held trading key.

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Solana RPC (optional, defaults to public endpoint)
NEXT_PUBLIC_SOLANA_RPC=https://your-helius-or-quicknode-url

# AI Hot Wallet (for autonomous trading - COMING SOON)
AI_HOT_WALLET_PRIVATE_KEY=your_private_key_here
```

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🤖 Agent Architecture

### 17-Agent Pipeline

**Discovery Phase**
- Bscoter: Token scouting and discovery
- Analuszer: Momentum analysis with LONG/SHORT direction
- CryptoGuru: Social sentiment analysis

**Planning Phase**
- Forecaster: Scenario simulation
- LongTermPlanner: Asset class routing
- ShortTermPlanner: Position sizing

**Compliance Phase**
- Overthinker: Tail risk simulation
- Reviewer: Contract safety audit
- MrGrumpy: Zero-tolerance enforcement
- RiskManager: Survival floor verification

**Executive Phase**
- Broker: Momentum advocacy
- Judge: Vote aggregation
- Verdicter: Mandate signing (with direction)
- Trader: Execution

**Audit Phase**
- RecordKeeper: Transaction logging
- RecordReviewer: Compliance verification
- Teacher: Learning optimization

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **Wallet**: @solana/wallet-adapter-react
- **Data**: DexScreener API, Jupiter API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📈 Performance Metrics

- **Refresh Rate**: 1 second for all real-time data
- **Event Stream**: Unlimited agent communication
- **Analysis**: Real-time LONG/SHORT call generation
- **Latency**: Sub-second price updates

## 🔐 Security

- All transactions require user signature
- No private keys stored in frontend
- Self-custody model by default
- On-chain vault for autonomous mode (coming soon)

## ⚠️ Disclaimer

**Not financial advice.** Memecoins can go to zero. You are responsible for every signed transaction. Past performance does not guarantee future results.

## 📞 Support

- GitHub Issues: [Alitiora-Initiative/Jolsel-Firm-Agent](https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent/issues)
- Documentation: See PLAN.md for architecture details

## 🚧 Roadmap

- [ ] Production-grade Anchor vault smart contract
- [ ] Autonomous trading with on-chain vault
- [ ] Treasury analytics with candlestick charts
- [ ] Multi-wallet support
- [ ] Advanced risk management
- [ ] Mobile application
