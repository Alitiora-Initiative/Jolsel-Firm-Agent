import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useFirm, r as AGENTS } from "./router-BHTuaQKJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Panels-hmLjTJho.js
var import_jsx_runtime = require_jsx_runtime();
function price(n) {
	if (!n) return "—";
	if (n < 1e-4) return `$${n.toExponential(2)}`;
	if (n < 1) return `$${n.toPrecision(3)}`;
	return `$${n.toLocaleString(void 0, { maximumFractionDigits: 2 })}`;
}
function StatusPanel() {
	const status = useFirm((s) => s.status);
	const cycle = useFirm((s) => s.cycle);
	const events = useFirm((s) => s.events);
	const last = useFirm((s) => s.mandates)[0];
	const error = useFirm((s) => s.error);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "hud p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-kicker",
					children: "System status"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-[var(--color-mint)]",
					children: status === "online" ? "ONLINE" : status === "connecting" ? "LINK" : "DEGRADED"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-y-1 font-mono text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[var(--color-muted)]",
						children: "Desks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right",
						children: [
							AGENTS.length,
							"/",
							AGENTS.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[var(--color-muted)]",
						children: "Cycle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-right",
						children: ["#", cycle || "—"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[var(--color-muted)]",
						children: "Last call"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right text-[var(--color-amber)]",
						children: last ? last.side : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[var(--color-muted)]",
						children: "Messages"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right",
						children: events.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-[var(--color-muted)]",
						children: "Fills"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right text-[var(--color-cyan)]",
						children: "0 unsigned"
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-[var(--color-rose)]",
				children: error
			})
		]
	});
}
function MarketPanel() {
	const pairs = useFirm((s) => s.pairs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "hud p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-kicker",
					children: "Solana tape"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[0.65rem] text-[var(--color-mint)]",
					children: "DEXSCREENER"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-1.5",
				children: [pairs.slice(0, 6).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-2 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: p.baseToken.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: price(p.priceUsd) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: p.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]",
							children: [
								p.changeH1 >= 0 ? "+" : "",
								p.changeH1.toFixed(1),
								"%"
							]
						})
					]
				}, p.pairAddress)), !pairs.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-xs text-[var(--color-muted)]",
					children: "Waiting on mainnet pairs…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker mt-3",
				children: "Live market feed"
			})
		]
	});
}
function EventStream() {
	const events = useFirm((s) => s.events);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "hud flex max-h-[46vh] flex-col p-3 lg:max-h-[52vh]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "label-kicker",
				children: "Live event stream"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[0.65rem] text-[var(--color-mint)]",
				children: "LIVE"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "min-h-0 flex-1 space-y-2 overflow-auto pr-1",
			children: [events.slice(0, 14).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "text-xs leading-snug",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-[var(--color-cyan)]",
					children: [
						e.from,
						" → ",
						e.to
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[var(--color-ink)]",
					children: e.message
				})]
			}, e.id)), !events.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-xs text-[var(--color-muted)]",
				children: "Desks quiet until the first tape."
			})]
		})]
	});
}
function Decisions() {
	const mandates = useFirm((s) => s.mandates);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "hud p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-kicker",
					children: "Latest calls"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/ledger",
					className: "text-xs text-[var(--color-cyan)] no-underline",
					children: "Ledger"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-1.5",
				children: [mandates.slice(0, 5).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: m.side === "VETO" ? "text-[var(--color-rose)]" : "text-[var(--color-mint)]",
							children: m.side === "VETO" ? "VETO" : "LONG"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: m.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: m.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]",
							children: [
								m.changeH1 >= 0 ? "+" : "",
								m.changeH1.toFixed(1),
								"%"
							]
						})
					]
				}, m.id)), !mandates.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-xs text-[var(--color-muted)]",
					children: "No calls yet."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[0.65rem] leading-snug text-[var(--color-muted)]",
				children: "Calls are reads of the public tape. Nothing is sent on-chain until you sign."
			})
		]
	});
}
function ProbePanel() {
	const head = useFirm((s) => s.events)[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "hud p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "label-kicker mb-1",
				children: "Crawler probe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: head ? `Visiting ${head.from}` : "Scanning desks…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-[var(--color-muted)]",
				children: head ? head.message : "Collecting the next mainnet cycle."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-2/3 animate-pulse bg-[var(--color-cyan)]" })
			})
		]
	});
}
//#endregion
export { StatusPanel as a, ProbePanel as i, EventStream as n, price as o, MarketPanel as r, Decisions as t };
