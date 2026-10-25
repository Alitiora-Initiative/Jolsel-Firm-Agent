import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useFirm } from "./router-BHTuaQKJ.mjs";
import { o as price } from "./Panels-hmLjTJho.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ledger-BWN9KyMc.js
var import_jsx_runtime = require_jsx_runtime();
function Ledger() {
	const mandates = useFirm((s) => s.mandates);
	const cycle = useFirm((s) => s.cycle);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-wide",
				children: "Mandate ledger"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-[var(--color-muted)]",
				children: [
					"Cycle #",
					cycle || "—",
					". Long means the desks cleared the public tape. It is not a fill."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hud mt-4 overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "label-kicker",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Call"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Token"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Score"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "1h"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Note"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [mandates.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-[var(--color-line)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: m.side === "VETO" ? "text-[var(--color-rose)]" : "text-[var(--color-mint)]",
									children: m.side
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-[var(--color-cyan)]",
									href: m.url,
									target: "_blank",
									rel: "noreferrer",
									children: m.symbol
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: m.score
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: price(m.priceUsd)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: [
									m.changeH1 >= 0 ? "+" : "",
									m.changeH1.toFixed(1),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-xs text-[var(--color-muted)]",
								children: m.reason
							})
						]
					}, m.id)), !mandates.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "px-3 py-6 text-[var(--color-muted)]",
						children: "The ledger fills after the first live cycle."
					}) })] })]
				})
			})
		]
	});
}
//#endregion
export { Ledger as component };
