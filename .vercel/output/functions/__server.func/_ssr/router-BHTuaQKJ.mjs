import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BHTuaQKJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/** The 17 desks from the Jolsel multi-agent firm. Order is orbital order. */
var AGENTS = [
	{
		id: "bscoter",
		name: "Bscoter",
		role: "Scouts liquid pairs",
		dept: "discovery",
		icon: "radar"
	},
	{
		id: "cryptoGuru",
		name: "Crypto Guru",
		role: "Crowd velocity",
		dept: "discovery",
		icon: "waves"
	},
	{
		id: "analuszer",
		name: "Analuszer",
		role: "Precision score",
		dept: "discovery",
		icon: "chart"
	},
	{
		id: "forecaster",
		name: "Forecaster",
		role: "Worth-it paths",
		dept: "planning",
		icon: "trend"
	},
	{
		id: "longTerm",
		name: "Long-Term Planner",
		role: "Asset-class router",
		dept: "planning",
		icon: "compass"
	},
	{
		id: "shortTerm",
		name: "Short-Term Planner",
		role: "Scale-in steps",
		dept: "planning",
		icon: "timer"
	},
	{
		id: "overthinker",
		name: "Overthinker",
		role: "Tail-risk map",
		dept: "compliance",
		icon: "brain"
	},
	{
		id: "reviewer",
		name: "Reviewer",
		role: "Pool structure",
		dept: "compliance",
		icon: "search"
	},
	{
		id: "mrGrumpy",
		name: "Mr Grumpy",
		role: "Zero-tolerance gate",
		dept: "compliance",
		icon: "alert"
	},
	{
		id: "risk",
		name: "Risk Manager",
		role: "Survival floor",
		dept: "compliance",
		icon: "shield"
	},
	{
		id: "broker",
		name: "Broker",
		role: "Momentum route",
		dept: "executive",
		icon: "zap"
	},
	{
		id: "judge",
		name: "Judge",
		role: "Vote aggregate",
		dept: "executive",
		icon: "scale"
	},
	{
		id: "verdicter",
		name: "Verdicter",
		role: "Signs mandate",
		dept: "executive",
		icon: "badge"
	},
	{
		id: "trader",
		name: "Trader",
		role: "Unsigned Jupiter route",
		dept: "executive",
		icon: "swap"
	},
	{
		id: "keeper",
		name: "Record Keeper",
		role: "Cycle ledger",
		dept: "audit",
		icon: "db"
	},
	{
		id: "reviewer2",
		name: "Record Reviewer",
		role: "Cycle quality",
		dept: "audit",
		icon: "file"
	},
	{
		id: "teacher",
		name: "Teacher",
		role: "Pipeline close",
		dept: "audit",
		icon: "grad"
	}
];
var DEPT_COLOR = {
	discovery: "var(--color-cyan)",
	planning: "var(--color-violet)",
	compliance: "var(--color-amber)",
	executive: "var(--color-mint)",
	audit: "var(--color-ember)"
};
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
/** Score a real DexScreener pair. No invented prices. */
function scorePair(p) {
	let s = 42;
	if (p.liquidityUsd >= 2e4) s += 12;
	if (p.liquidityUsd >= 8e4) s += 8;
	if (p.volumeH24 >= 4e4) s += 8;
	if (p.volumeH24 >= 25e4) s += 6;
	const tx = p.buysH1 + p.sellsH1;
	if (tx >= 40) s += 8;
	if (tx >= 150) s += 6;
	const ratio = tx > 0 ? p.buysH1 / tx : .5;
	if (ratio >= .55 && ratio <= .78) s += 8;
	if (p.changeH1 >= 4 && p.changeH1 <= 45) s += 14;
	else if (p.changeH1 > 45 && p.changeH1 <= 90) s += 6;
	else if (p.changeH1 > 120) s -= 12;
	else if (p.changeH1 < -8) s -= 10;
	if (p.fdv > 0 && p.liquidityUsd > 0 && p.fdv / p.liquidityUsd > 400 && p.liquidityUsd < 4e4) s -= 14;
	return clamp(Math.round(s), 0, 98);
}
function ev(cycle, n, from, to, kind, message) {
	return {
		id: `${cycle}-${n}-${from}`,
		at: Date.now(),
		from,
		to,
		kind,
		message
	};
}
var usd = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}k` : `$${n.toFixed(0)}`;
/**
* One pass of the Jolsel firm over the live Solana pair tape.
* Mandates are unsigned — nothing here broadcasts a transaction.
*/
function runCycle(pairs, cycle) {
	const events = [];
	let i = 0;
	const push = (from, to, kind, message) => {
		events.push(ev(cycle, i++, from, to, kind, message));
	};
	if (!pairs.length) {
		push("bscoter", "analuszer", "scan", "DexScreener Solana tape returned no pairs this cycle.");
		push("teacher", "bscoter", "complete", "Pipeline held. Waiting on the mainnet feed.");
		return {
			events,
			mandate: null,
			score: 0,
			selected: null,
			veto: true
		};
	}
	const top = [...pairs].sort((a, b) => scorePair(b) - scorePair(a))[0];
	const score = scorePair(top);
	const tx = top.buysH1 + top.sellsH1;
	push("bscoter", "cryptoGuru", "scan", `Scanned ${pairs.length} Solana pairs. Lead ${top.baseToken.symbol} on ${top.dexId}.`);
	push("cryptoGuru", "analuszer", "analysis", `${top.baseToken.symbol} 1h flow ${top.buysH1} buys / ${top.sellsH1} sells (${tx} tx).`);
	push("analuszer", "forecaster", score >= 80 ? "opportunity" : "analysis", `${top.baseToken.symbol} precision ${score}. Liq ${usd(top.liquidityUsd)} · 1h ${top.changeH1.toFixed(1)}%.`);
	let veto = false;
	let vetoReason = "";
	if (score < 80) {
		push("forecaster", "judge", "risk", `${top.baseToken.symbol} below the 80 gate. No mandate.`);
		veto = true;
		vetoReason = `Score ${score} under the Analuszer gate.`;
	} else {
		const worth = top.changeH1 > -5 && top.liquidityUsd >= 15e3;
		push("forecaster", "longTerm", worth ? "opportunity" : "risk", worth ? `${top.baseToken.symbol} worth a look. Trail idea 25% if a wallet later signs.` : `${top.baseToken.symbol} path rejected on momentum or liquidity.`);
		push("longTerm", "shortTerm", "analysis", "Desk stays on MEME_COIN while the book is an unsigned Solana tape.");
		push("shortTerm", "overthinker", "analysis", `Scale-in not armed. Spot only, full size waits on a signed Jupiter swap.`);
		const thin = top.liquidityUsd < 15e3;
		const crash = top.changeH1 <= -25;
		const blowoff = top.changeH1 >= 140;
		const stretched = top.fdv > 0 && top.liquidityUsd > 0 && top.fdv / top.liquidityUsd > 500;
		push("overthinker", "reviewer", thin || crash ? "risk" : "compliance", thin ? `Tail risk: liquidity only ${usd(top.liquidityUsd)}.` : crash ? `Tail risk: 1h print ${top.changeH1.toFixed(1)}%.` : "No cascade flag on the public tape.");
		push("reviewer", "mrGrumpy", stretched ? "risk" : "compliance", stretched ? `FDV/liquidity stretched (${Math.round(top.fdv / top.liquidityUsd)}×). Not a contract audit.` : `Pool ${top.dexId} ${usd(top.liquidityUsd)} visible. Not a mint-authority audit.`);
		if (thin) {
			veto = true;
			vetoReason = "MR_GRUMPY: liquidity under the $15k floor.";
		} else if (crash) {
			veto = true;
			vetoReason = "MR_GRUMPY: 1h drawdown past −25%.";
		} else if (blowoff) {
			veto = true;
			vetoReason = "MR_GRUMPY: 1h extension past +140%.";
		}
		push("mrGrumpy", "risk", veto ? "veto" : "compliance", veto ? vetoReason : "Zero-tolerance scan passed on public metrics.");
		push("risk", veto ? "keeper" : "broker", veto ? "veto" : "compliance", veto ? "Survival floor holds. No route requested." : "No wallet balance on this desk — size stays a quote, not a fill.");
		if (!veto && worth) {
			push("broker", "judge", "opportunity", `${top.baseToken.symbol} momentum cleared. Asking the chamber.`);
			push("judge", "verdicter", "mandate", `Votes conform. Score ${score} on live tape.`);
			push("verdicter", "trader", "mandate", `Mandate signed for ${top.baseToken.symbol}. Still unsigned — no transaction sent.`);
			push("trader", "keeper", "route", `Jupiter route prepared for ${top.baseToken.symbol} (${top.baseToken.address.slice(0, 4)}…${top.baseToken.address.slice(-4)}).`);
		} else if (!veto && !worth) {
			veto = true;
			vetoReason = "Forecaster: path not worth the route.";
			push("judge", "keeper", "veto", vetoReason);
		}
	}
	push("keeper", "reviewer2", "audit", `Cycle #${cycle} logged. Lead ${top.baseToken.symbol} @ $${top.priceUsd < .01 ? top.priceUsd.toExponential(2) : top.priceUsd.toPrecision(4)}.`);
	push("reviewer2", "teacher", "audit", veto ? "Cycle closed without a mandate." : "Mandate recorded. Fill requires a wallet signature.");
	push("teacher", "bscoter", "complete", `Pipeline #${cycle} complete. ${AGENTS.length} desks reported.`);
	return {
		events,
		mandate: veto ? {
			id: `v-${cycle}-${top.pairAddress}`,
			at: Date.now(),
			symbol: top.baseToken.symbol,
			mint: top.baseToken.address,
			pairAddress: top.pairAddress,
			side: "VETO",
			score,
			priceUsd: top.priceUsd,
			liquidityUsd: top.liquidityUsd,
			changeH1: top.changeH1,
			reason: vetoReason || "Held.",
			url: top.url
		} : {
			id: `m-${cycle}-${top.pairAddress}`,
			at: Date.now(),
			symbol: top.baseToken.symbol,
			mint: top.baseToken.address,
			pairAddress: top.pairAddress,
			side: "LONG",
			score,
			priceUsd: top.priceUsd,
			liquidityUsd: top.liquidityUsd,
			changeH1: top.changeH1,
			reason: `Unsigned long mandate. Score ${score}. You must sign on Jupiter.`,
			url: top.url
		},
		score,
		selected: top,
		veto
	};
}
var useFirm = create((set, get) => ({
	pairs: [],
	events: [],
	mandates: [],
	cycle: 0,
	status: "connecting",
	error: "",
	selected: null,
	score: 0,
	veto: false,
	pulses: {},
	polling: false,
	poll: async () => {
		if (get().polling) return;
		set({ polling: true });
		try {
			const res = await fetch("/api/market");
			if (!res.ok) throw new Error(`Market feed ${res.status}`);
			const data = await res.json();
			const pairs = data.pairs ?? [];
			const cycle = get().cycle + 1;
			const result = runCycle(pairs, cycle);
			const pulses = { ...get().pulses };
			const now = Date.now();
			for (const e of result.events) {
				pulses[e.from] = now;
				pulses[e.to] = now;
			}
			const mandates = result.mandate ? [result.mandate, ...get().mandates].slice(0, 24) : get().mandates;
			set({
				pairs,
				events: [...result.events].reverse().concat(get().events).slice(0, 80),
				mandates,
				cycle,
				status: pairs.length ? "online" : "degraded",
				error: data.error ?? "",
				selected: result.selected,
				score: result.score,
				veto: result.veto,
				pulses,
				polling: false
			});
		} catch (err) {
			set({
				status: "degraded",
				error: err instanceof Error ? err.message : "Feed failed",
				polling: false
			});
		}
	}
}));
var NAV = [
	{
		to: "/",
		label: "Core"
	},
	{
		to: "/terminal",
		label: "Terminal"
	},
	{
		to: "/agents",
		label: "Desks"
	},
	{
		to: "/ledger",
		label: "Ledger"
	}
];
function Shell({ children }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const poll = useFirm((s) => s.poll);
	const status = useFirm((s) => s.status);
	(0, import_react.useEffect)(() => {
		poll();
		const id = window.setInterval(() => void poll(), 14e3);
		return () => window.clearInterval(id);
	}, [poll]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0",
				style: { background: "radial-gradient(900px 520px at 50% 42%, color-mix(in srgb, var(--color-ember) 16%, transparent), transparent 60%), radial-gradient(700px 480px at 70% 30%, color-mix(in srgb, var(--color-violet) 14%, transparent), transparent 55%), var(--color-void)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-30 flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-3 py-2 sm:px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 no-underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-8 w-8 place-items-center rounded-full border border-[var(--color-cyan)]",
							style: { boxShadow: "0 0 16px color-mix(in srgb, var(--color-cyan) 50%, transparent)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-full bg-[var(--color-cyan)]" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold tracking-[0.22em] text-[var(--color-ink)]",
							children: "JOLSEL FIRM"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label-kicker",
							children: "Solana mainnet · 17 desks"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex items-center gap-1",
						children: NAV.map((item) => {
							const on = path === item.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: "rounded-full px-3 py-1.5 text-sm no-underline",
								style: {
									color: on ? "var(--color-void)" : "var(--color-ink)",
									background: on ? "var(--color-cyan)" : "transparent"
								},
								children: item.label
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "label-kicker hidden sm:inline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 inline-block h-2 w-2 rounded-full",
							style: {
								background: status === "online" ? "var(--color-mint)" : "var(--color-amber)",
								boxShadow: "0 0 8px currentColor"
							}
						}), status === "online" ? "LIVE TAPE" : status === "connecting" ? "LINKING" : "DEGRADED"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children
			})
		]
	});
}
var styles_default = "/assets/styles-IsTIAzLE.css";
var APP_NAME = "Jolsel Firm";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Jolsel Firm — live Solana memecoin desk. Seventeen agents read the mainnet tape. You sign every swap."
			},
			{
				name: "theme-color",
				content: "#03060f"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Rajdhani:wght@500;600;700&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$3 = () => import("./routes-BIbvQIuQ.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./agents-48kRx8OY.mjs");
var Route$4 = createFileRoute("/agents")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./ledger-BWN9KyMc.mjs");
var Route$3 = createFileRoute("/ledger")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./terminal-SNeGy03k.mjs");
var Route$2 = createFileRoute("/terminal")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function num(v) {
	const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
	return Number.isFinite(n) ? n : 0;
}
function mapPair(p) {
	if (p.chainId !== "solana") return null;
	if (!p.pairAddress || !p.baseToken?.address || !p.baseToken.symbol) return null;
	return {
		chainId: "solana",
		dexId: p.dexId || "dex",
		pairAddress: p.pairAddress,
		baseToken: {
			address: p.baseToken.address,
			name: p.baseToken.name || p.baseToken.symbol,
			symbol: p.baseToken.symbol
		},
		quoteToken: { symbol: p.quoteToken?.symbol || "SOL" },
		priceUsd: num(p.priceUsd),
		changeH1: num(p.priceChange?.h1),
		changeH24: num(p.priceChange?.h24),
		volumeH24: num(p.volume?.h24),
		liquidityUsd: num(p.liquidity?.usd),
		buysH1: num(p.txns?.h1?.buys),
		sellsH1: num(p.txns?.h1?.sells),
		fdv: num(p.fdv),
		url: p.url || `https://dexscreener.com/solana/${p.pairAddress}`
	};
}
async function loadSolanaTape() {
	const boostsRes = await fetch("https://api.dexscreener.com/token-boosts/top/v1", { headers: { accept: "application/json" } });
	if (!boostsRes.ok) throw new Error(`DexScreener boosts ${boostsRes.status}`);
	const boosts = await boostsRes.json();
	const mints = [...new Set((Array.isArray(boosts) ? boosts : []).filter((b) => b.chainId === "solana" && b.tokenAddress).map((b) => b.tokenAddress))].slice(0, 30);
	if (!mints.length) return [];
	const pairsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mints.join(",")}`, { headers: { accept: "application/json" } });
	if (!pairsRes.ok) throw new Error(`DexScreener pairs ${pairsRes.status}`);
	const mapped = ((await pairsRes.json()).pairs ?? []).map(mapPair).filter((p) => !!p);
	const best = /* @__PURE__ */ new Map();
	for (const p of mapped) {
		const prev = best.get(p.baseToken.address);
		if (!prev || p.liquidityUsd > prev.liquidityUsd) best.set(p.baseToken.address, p);
	}
	return [...best.values()].filter((p) => p.liquidityUsd >= 8e3).sort((a, b) => b.volumeH24 - a.volumeH24).slice(0, 18);
}
var Route$1 = createFileRoute("/api/market")({ server: { handlers: { GET: async () => {
	try {
		const pairs = await loadSolanaTape();
		return Response.json({
			pairs,
			ts: Date.now()
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "market feed failed";
		return Response.json({
			pairs: [],
			error: message
		}, { status: 200 });
	}
} } } });
var SOL = "So11111111111111111111111111111111111111112";
var Route = createFileRoute("/api/quote")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const outputMint = url.searchParams.get("mint") || "";
	const lamports = url.searchParams.get("amount") || "50000000";
	if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(outputMint)) return Response.json({ error: "mint required" }, { status: 400 });
	const q = new URL("https://quote-api.jup.ag/v6/quote");
	q.searchParams.set("inputMint", SOL);
	q.searchParams.set("outputMint", outputMint);
	q.searchParams.set("amount", lamports);
	q.searchParams.set("slippageBps", "100");
	try {
		const res = await fetch(q, { headers: { accept: "application/json" } });
		const text = await res.text();
		if (!res.ok) return Response.json({
			error: `Jupiter ${res.status}`,
			detail: text.slice(0, 280)
		}, { status: 502 });
		const quote = JSON.parse(text);
		const labels = (quote.routePlan ?? []).map((s) => s.swapInfo?.label).filter((x) => !!x);
		return Response.json({
			inAmount: quote.inAmount,
			outAmount: quote.outAmount,
			priceImpactPct: quote.priceImpactPct,
			labels: [...new Set(labels)].slice(0, 4),
			input: "0.05 SOL"
		});
	} catch (err) {
		return Response.json({ error: err instanceof Error ? err.message : "quote failed" }, { status: 502 });
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	AgentsRoute: Route$4.update({
		id: "/agents",
		path: "/agents",
		getParentRoute: () => Route$6
	}),
	LedgerRoute: Route$3.update({
		id: "/ledger",
		path: "/ledger",
		getParentRoute: () => Route$6
	}),
	TerminalRoute: Route$2.update({
		id: "/terminal",
		path: "/terminal",
		getParentRoute: () => Route$6
	}),
	ApiMarketRoute: Route$1.update({
		id: "/api/market",
		path: "/api/market",
		getParentRoute: () => Route$6
	}),
	ApiQuoteRoute: Route.update({
		id: "/api/quote",
		path: "/api/quote",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { DEPT_COLOR as i, useFirm as n, AGENTS as r, router_exports as t };
