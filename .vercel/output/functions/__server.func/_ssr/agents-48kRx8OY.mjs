import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as DEPT_COLOR, n as useFirm, r as AGENTS } from "./router-BHTuaQKJ.mjs";
import { t as AgentIcon } from "./icons-_q1kb1Ma.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-48kRx8OY.js
var import_jsx_runtime = require_jsx_runtime();
function AgentsPage() {
	const pulses = useFirm((s) => s.pulses);
	const events = useFirm((s) => s.events);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-wide",
				children: "Seventeen desks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-[var(--color-muted)]",
				children: "The same firm that orbits Jolsel Core. A desk glows when it spoke on the latest mainnet cycle."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: AGENTS.map((a, i) => {
					const hot = Date.now() - (pulses[a.id] ?? 0) < 8e3;
					const last = events.find((e) => e.from === a.id);
					const color = DEPT_COLOR[a.dept];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "hud p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-10 w-10 place-items-center rounded-full border bg-[var(--color-void)]",
									style: {
										borderColor: color,
										color,
										boxShadow: hot ? `0 0 12px ${color}` : "none"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentIcon, { name: a.icon })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-semibold",
									children: [
										i + 1,
										". ",
										a.name
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "label-kicker",
									children: a.dept
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm",
								children: a.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-[var(--color-muted)]",
								children: last?.message ?? "Silent this cycle."
							})
						]
					}, a.id);
				})
			})
		]
	});
}
//#endregion
export { AgentsPage as component };
