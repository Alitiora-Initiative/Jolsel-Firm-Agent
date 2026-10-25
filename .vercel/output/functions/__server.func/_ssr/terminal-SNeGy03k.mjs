import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useFirm } from "./router-BHTuaQKJ.mjs";
import { o as price } from "./Panels-hmLjTJho.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terminal-SNeGy03k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Terminal() {
	const pairs = useFirm((s) => s.pairs);
	const selected = useFirm((s) => s.selected);
	const [mint, setMint] = (0, import_react.useState)(null);
	const [quote, setQuote] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const active = pairs.find((p) => p.baseToken.address === mint) || selected || pairs[0] || null;
	const loadQuote = async () => {
		if (!active) return;
		setBusy(true);
		setQuote(null);
		try {
			const data = await (await fetch(`/api/quote?mint=${encodeURIComponent(active.baseToken.address)}`)).json();
			setQuote(data);
		} catch (err) {
			setQuote({ error: err instanceof Error ? err.message : "Quote failed" });
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid gap-3 p-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hud max-h-[70vh] overflow-auto p-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "label-kicker px-2 py-2",
				children: "Boosted Solana pairs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [pairs.map((p) => {
				const on = active?.pairAddress === p.pairAddress;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setMint(p.baseToken.address);
						setQuote(null);
					},
					className: "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left",
					style: { background: on ? "color-mix(in srgb, var(--color-cyan) 12%, transparent)" : "transparent" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-semibold",
						children: p.baseToken.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[0.65rem] text-[var(--color-muted)]",
						children: p.dexId
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-right font-mono text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block",
							children: price(p.priceUsd)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: p.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]",
							children: [
								p.changeH1 >= 0 ? "+" : "",
								p.changeH1.toFixed(1),
								"%"
							]
						})]
					})]
				}) }, p.pairAddress);
			}), !pairs.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-2 py-4 text-sm text-[var(--color-muted)]",
				children: "Tape loading…"
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hud overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold",
						children: active ? `${active.baseToken.symbol} / ${active.quoteToken.symbol}` : "Terminal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-[var(--color-muted)]",
						children: active ? active.baseToken.address : "Pick a pair"
					})] }), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "text-sm text-[var(--color-cyan)]",
						href: active.url,
						target: "_blank",
						rel: "noreferrer",
						children: "DexScreener"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[420px] bg-black",
					children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: "DexScreener chart",
						className: "h-full w-full border-0",
						src: `https://dexscreener.com/solana/${active.pairAddress}?embed=1&theme=dark&trades=0&info=0`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-full place-items-center text-sm text-[var(--color-muted)]",
						children: "Chart appears when the tape arrives."
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hud p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Mainnet quote · 0.05 SOL in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-[var(--color-muted)]",
						children: "Jupiter returns a real route. This desk does not hold keys and will not send the swap."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: !active || busy,
							onClick: () => void loadQuote(),
							className: "rounded-full bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-[var(--color-void)] disabled:opacity-40",
							children: busy ? "Quoting…" : "Fetch Jupiter quote"
						}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)] no-underline",
							href: `https://jup.ag/swap/SOL-${active.baseToken.address}`,
							target: "_blank",
							rel: "noreferrer",
							children: "Sign on Jupiter"
						})]
					}),
					quote?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-[var(--color-rose)]",
						children: quote.error
					}),
					quote?.outAmount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-2 gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[var(--color-muted)]",
								children: "In"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: quote.input }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[var(--color-muted)]",
								children: "Out (raw)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "break-all",
								children: quote.outAmount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[var(--color-muted)]",
								children: "Impact"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: quote.priceImpactPct ?? "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[var(--color-muted)]",
								children: "Venues"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: quote.labels?.join(" · ") || "—" })
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { Terminal as component };
