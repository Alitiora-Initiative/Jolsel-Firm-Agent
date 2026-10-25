import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as DEPT_COLOR, n as useFirm, r as AGENTS } from "./router-BHTuaQKJ.mjs";
import { t as AgentIcon } from "./icons-_q1kb1Ma.mjs";
import { a as StatusPanel, i as ProbePanel, n as EventStream, r as MarketPanel, t as Decisions } from "./Panels-hmLjTJho.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BIbvQIuQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_COLOR = {
	scan: "#3ee0ff",
	analysis: "#a78bfa",
	opportunity: "#3dffb0",
	risk: "#ffb020",
	compliance: "#7fd0ff",
	veto: "#ff4d6a",
	mandate: "#3dffb0",
	route: "#ff6a3d",
	audit: "#ffb020",
	complete: "#3ee0ff"
};
var indexOf = new Map(AGENTS.map((a, i) => [a.id, i]));
function GravityStage() {
	const boxRef = (0, import_react.useRef)(null);
	const svgRef = (0, import_react.useRef)(null);
	const packets = (0, import_react.useRef)([]);
	const seen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const crawler = (0, import_react.useRef)(0);
	const crawlerFrom = (0, import_react.useRef)(0);
	const pulses = useFirm((s) => s.pulses);
	const veto = useFirm((s) => s.veto);
	const selected = useFirm((s) => s.selected);
	const events = useFirm((s) => s.events);
	const nodes = (0, import_react.useMemo)(() => AGENTS.map((a, i) => {
		const ang = -Math.PI / 2 + i / AGENTS.length * Math.PI * 2;
		return {
			...a,
			ang,
			i,
			left: (50 + Math.cos(ang) * 42).toFixed(2),
			top: (50 + Math.sin(ang) * 40).toFixed(2)
		};
	}), []);
	(0, import_react.useEffect)(() => {
		for (const e of events.slice(0, 12)) {
			if (seen.current.has(e.id)) continue;
			seen.current.add(e.id);
			const from = indexOf.get(e.from) ?? 0;
			const to = indexOf.get(e.to) ?? 0;
			packets.current.push({
				id: e.id,
				from,
				to,
				kind: e.kind,
				born: performance.now()
			});
			crawlerFrom.current = crawler.current;
			crawler.current = from;
		}
		if (packets.current.length > 24) packets.current.splice(0, packets.current.length - 24);
		if (seen.current.size > 200) seen.current.clear();
	}, [events]);
	(0, import_react.useEffect)(() => {
		const svg = svgRef.current;
		const box = boxRef.current;
		if (!svg || !box) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const stars = Array.from({ length: 60 }, () => ({
			x: Math.random(),
			y: Math.random(),
			r: Math.random() * 1.1 + .3
		}));
		let raf = 0;
		const pos = (i, w, h) => {
			const ang = -Math.PI / 2 + i / AGENTS.length * Math.PI * 2;
			const rx = Math.min(w, h) * .4;
			return {
				x: w / 2 + Math.cos(ang) * rx,
				y: h / 2 + Math.sin(ang) * rx * .95
			};
		};
		const ns = "http://www.w3.org/2000/svg";
		const clear = () => {
			while (svg.firstChild) svg.removeChild(svg.firstChild);
		};
		const el = (name, attrs) => {
			const node = document.createElementNS(ns, name);
			for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
			svg.appendChild(node);
			return node;
		};
		const draw = (now) => {
			const rect = box.getBoundingClientRect();
			const w = Math.max(1, rect.width);
			const h = Math.max(1, rect.height);
			svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
			clear();
			for (const s of stars) el("circle", {
				cx: String(s.x * w),
				cy: String(s.y * h),
				r: String(s.r),
				fill: "rgba(180,210,255,0.45)"
			});
			const cx = w / 2;
			const cy = h / 2;
			const spin = reduce ? .4 : now / 9e3;
			const ring = Math.min(w, h) * .3;
			for (let k = 0; k < 3; k++) el("ellipse", {
				cx: String(cx),
				cy: String(cy),
				rx: String(ring + k * 12),
				ry: String((ring + k * 12) * .86),
				fill: "none",
				stroke: k === 1 ? "rgba(255,120,50,0.4)" : "rgba(80,170,255,0.25)",
				"stroke-width": k === 1 ? "6" : "2",
				transform: `rotate(${spin * (k === 1 ? 40 : -24) * 180 / Math.PI} ${cx} ${cy})`
			});
			const bits = reduce ? 20 : 64;
			for (let i = 0; i < bits; i++) {
				const a = spin * 2 + i / bits * Math.PI * 2;
				const rx = ring * 1.05;
				const ry = rx * .82;
				const hot = i % 9 === 0;
				el("circle", {
					cx: String(cx + Math.cos(a) * rx),
					cy: String(cy + Math.sin(a) * ry),
					r: hot ? "2.4" : "1.15",
					fill: hot ? "rgba(255,150,70,0.95)" : "rgba(120,220,255,0.55)"
				});
			}
			const life = 1600;
			packets.current = packets.current.filter((p) => now - p.born < life);
			for (const p of packets.current) {
				const t = Math.min(1, (now - p.born) / life);
				const ease = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
				const a = pos(p.from, w, h);
				const b = pos(p.to, w, h);
				const cpx = cx * .35 + (a.x + b.x) * .325;
				const cpy = cy * .35 + (a.y + b.y) * .325;
				const x = (1 - ease) ** 2 * a.x + 2 * (1 - ease) * ease * cpx + ease ** 2 * b.x;
				const y = (1 - ease) ** 2 * a.y + 2 * (1 - ease) * ease * cpy + ease ** 2 * b.y;
				el("path", {
					d: `M ${a.x} ${a.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`,
					fill: "none",
					stroke: KIND_COLOR[p.kind],
					"stroke-width": "1.2",
					opacity: "0.4"
				});
				el("circle", {
					cx: String(x),
					cy: String(y),
					r: p.kind === "veto" || p.kind === "mandate" ? "4" : "3",
					fill: KIND_COLOR[p.kind]
				});
			}
			const hop = 3200;
			const ct = (reduce ? 0 : now) % hop / hop;
			const cf = pos(crawlerFrom.current, w, h);
			const ctg = pos(crawler.current, w, h);
			const px = cf.x + (ctg.x - cf.x) * ct;
			const py = cf.y + (ctg.y - cf.y) * ct;
			const ang = Math.atan2(ctg.y - cf.y, ctg.x - cf.x);
			el("polygon", {
				points: "12,0 -8,5 -4,0 -8,-5",
				fill: "#7fdfff",
				transform: `translate(${px} ${py}) rotate(${ang * 180 / Math.PI})`
			});
			if (!reduce) raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: boxRef,
		className: "relative mx-auto aspect-square w-full max-w-[760px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				ref: svgRef,
				className: "absolute inset-0 h-full w-full",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute left-1/2 top-1/2 z-10 w-[30%] -translate-x-1/2 -translate-y-1/2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto aspect-square w-[86%] rounded-full",
					style: {
						background: "radial-gradient(circle at 50% 50%, #000 0 42%, rgba(255,120,40,0.55) 48%, rgba(80,40,160,0.2) 62%, transparent 70%)",
						boxShadow: veto ? "0 0 40px rgba(255,77,106,0.55)" : "0 0 50px rgba(255,120,40,0.35)"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "-mt-[22%] px-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[0.62rem] font-semibold tracking-[0.16em] sm:text-sm",
							children: "JOLSEL CORE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "label-kicker mt-1 hidden leading-relaxed sm:block",
							children: [
								"Decision · coordination",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"unsigned execution"
							]
						}),
						selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[0.6rem] text-[var(--color-amber)]",
							children: [selected.baseToken.symbol, veto ? " · VETO" : " · MANDATE"]
						})
					]
				})]
			}),
			nodes.map((n) => {
				const hot = Date.now() - (pulses[n.id] ?? 0) < 4e3;
				const color = DEPT_COLOR[n.dept];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute z-20 w-10 -translate-x-1/2 -translate-y-1/2 text-center sm:w-[5.5rem]",
					style: {
						left: `${n.left}%`,
						top: `${n.top}%`
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto grid h-8 w-8 place-items-center rounded-full border bg-[var(--color-void)] sm:h-11 sm:w-11",
							style: {
								borderColor: color,
								color,
								boxShadow: hot ? `0 0 16px ${color}` : "none"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentIcon, { name: n.icon })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 hidden truncate text-[0.62rem] font-semibold leading-tight sm:block",
							children: n.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden truncate text-[0.58rem] text-[var(--color-muted)] md:block",
							children: n.role
						})
					]
				}, n.id);
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid gap-3 p-3 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "order-2 flex flex-col gap-3 lg:order-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketPanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:mt-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProbePanel, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "order-1 lg:order-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker mb-2 text-center",
						children: "Real-time desk network · live message flow · unsigned routes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GravityStage, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center font-mono text-[0.65rem] tracking-[0.22em] text-[var(--color-muted)]",
						children: "DIFFERENT DESKS. ONE TAPE. YOU SIGN."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "order-3 flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventStream, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Decisions, {})]
			})
		]
	});
}
//#endregion
export { Home as component };
