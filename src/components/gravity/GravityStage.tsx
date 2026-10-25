import { useEffect, useMemo, useRef } from "react";
import { AGENTS, DEPT_COLOR } from "@/lib/firm/agents";
import { useFirm } from "@/lib/firm/store";
import type { EventKind } from "@/lib/firm/types";
import { AgentIcon } from "./icons";

type Packet = {
  id: string;
  from: number;
  to: number;
  kind: EventKind;
  born: number;
};

const KIND_COLOR: Record<EventKind, string> = {
  scan: "#3ee0ff",
  analysis: "#a78bfa",
  opportunity: "#3dffb0",
  risk: "#ffb020",
  compliance: "#7fd0ff",
  veto: "#ff4d6a",
  mandate: "#3dffb0",
  route: "#ff6a3d",
  audit: "#ffb020",
  complete: "#3ee0ff",
};

const indexOf = new Map(AGENTS.map((a, i) => [a.id, i]));

export function GravityStage() {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const packets = useRef<Packet[]>([]);
  const seen = useRef(new Set<string>());
  const crawler = useRef(0);
  const crawlerFrom = useRef(0);
  const pulses = useFirm((s) => s.pulses);
  const veto = useFirm((s) => s.veto);
  const selected = useFirm((s) => s.selected);
  const events = useFirm((s) => s.events);

  const nodes = useMemo(
    () =>
      AGENTS.map((a, i) => {
        const ang = -Math.PI / 2 + (i / AGENTS.length) * Math.PI * 2;
        return {
          ...a,
          ang,
          i,
          left: (50 + Math.cos(ang) * 42).toFixed(2),
          top: (50 + Math.sin(ang) * 40).toFixed(2),
        };
      }),
    [],
  );

  useEffect(() => {
    for (const e of events.slice(0, 12)) {
      if (seen.current.has(e.id)) continue;
      seen.current.add(e.id);
      const from = indexOf.get(e.from) ?? 0;
      const to = indexOf.get(e.to) ?? 0;
      packets.current.push({ id: e.id, from, to, kind: e.kind, born: performance.now() });
      crawlerFrom.current = crawler.current;
      crawler.current = from;
    }
    if (packets.current.length > 24) packets.current.splice(0, packets.current.length - 24);
    if (seen.current.size > 200) seen.current.clear();
  }, [events]);

  useEffect(() => {
    const svg = svgRef.current;
    const box = boxRef.current;
    if (!svg || !box) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.3,
    }));
    let raf = 0;

    const pos = (i: number, w: number, h: number) => {
      const ang = -Math.PI / 2 + (i / AGENTS.length) * Math.PI * 2;
      const rx = Math.min(w, h) * 0.4;
      return { x: w / 2 + Math.cos(ang) * rx, y: h / 2 + Math.sin(ang) * rx * 0.95 };
    };

    const ns = "http://www.w3.org/2000/svg";
    const clear = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    };
    const el = (name: string, attrs: Record<string, string>) => {
      const node = document.createElementNS(ns, name);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
      svg.appendChild(node);
      return node;
    };

    const draw = (now: number) => {
      const rect = box.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      clear();

      for (const s of stars) {
        el("circle", {
          cx: String(s.x * w),
          cy: String(s.y * h),
          r: String(s.r),
          fill: "rgba(180,210,255,0.45)",
        });
      }

      const cx = w / 2;
      const cy = h / 2;
      const spin = reduce ? 0.4 : now / 9000;
      const ring = Math.min(w, h) * 0.3;
      for (let k = 0; k < 3; k++) {
        el("ellipse", {
          cx: String(cx),
          cy: String(cy),
          rx: String(ring + k * 12),
          ry: String((ring + k * 12) * 0.86),
          fill: "none",
          stroke: k === 1 ? "rgba(255,120,50,0.4)" : "rgba(80,170,255,0.25)",
          "stroke-width": k === 1 ? "6" : "2",
          transform: `rotate(${((spin * (k === 1 ? 40 : -24)) * 180) / Math.PI} ${cx} ${cy})`,
        });
      }
      const bits = reduce ? 20 : 64;
      for (let i = 0; i < bits; i++) {
        const a = spin * 2 + (i / bits) * Math.PI * 2;
        const rx = ring * 1.05;
        const ry = rx * 0.82;
        const hot = i % 9 === 0;
        el("circle", {
          cx: String(cx + Math.cos(a) * rx),
          cy: String(cy + Math.sin(a) * ry),
          r: hot ? "2.4" : "1.15",
          fill: hot ? "rgba(255,150,70,0.95)" : "rgba(120,220,255,0.55)",
        });
      }

      const life = 1600;
      packets.current = packets.current.filter((p) => now - p.born < life);
      for (const p of packets.current) {
        const t = Math.min(1, (now - p.born) / life);
        const ease = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        const a = pos(p.from, w, h);
        const b = pos(p.to, w, h);
        const cpx = cx * 0.35 + (a.x + b.x) * 0.325;
        const cpy = cy * 0.35 + (a.y + b.y) * 0.325;
        const x = (1 - ease) ** 2 * a.x + 2 * (1 - ease) * ease * cpx + ease ** 2 * b.x;
        const y = (1 - ease) ** 2 * a.y + 2 * (1 - ease) * ease * cpy + ease ** 2 * b.y;
        el("path", {
          d: `M ${a.x} ${a.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`,
          fill: "none",
          stroke: KIND_COLOR[p.kind],
          "stroke-width": "1.2",
          opacity: "0.4",
        });
        el("circle", {
          cx: String(x),
          cy: String(y),
          r: p.kind === "veto" || p.kind === "mandate" ? "4" : "3",
          fill: KIND_COLOR[p.kind],
        });
      }

      const hop = 3200;
      const ct = ((reduce ? 0 : now) % hop) / hop;
      const cf = pos(crawlerFrom.current, w, h);
      const ctg = pos(crawler.current, w, h);
      const px = cf.x + (ctg.x - cf.x) * ct;
      const py = cf.y + (ctg.y - cf.y) * ct;
      const ang = Math.atan2(ctg.y - cf.y, ctg.x - cf.x);
      el("polygon", {
        points: "12,0 -8,5 -4,0 -8,-5",
        fill: "#7fdfff",
        transform: `translate(${px} ${py}) rotate(${(ang * 180) / Math.PI})`,
      });

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={boxRef} className="relative mx-auto aspect-square w-full max-w-[760px]">
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[30%] -translate-x-1/2 -translate-y-1/2 text-center">
        <div
          className="mx-auto aspect-square w-[86%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #000 0 42%, rgba(255,120,40,0.55) 48%, rgba(80,40,160,0.2) 62%, transparent 70%)",
            boxShadow: veto ? "0 0 40px rgba(255,77,106,0.55)" : "0 0 50px rgba(255,120,40,0.35)",
          }}
        />
        <div className="-mt-[22%] px-1">
          <div className="text-[0.62rem] font-semibold tracking-[0.16em] sm:text-sm">JOLSEL CORE</div>
          <p className="label-kicker mt-1 hidden leading-relaxed sm:block">
            Decision · coordination
            <br />
            unsigned execution
          </p>
          {selected && (
            <p className="mt-1 font-mono text-[0.6rem] text-[var(--color-amber)]">
              {selected.baseToken.symbol}
              {veto ? " · VETO" : " · MANDATE"}
            </p>
          )}
        </div>
      </div>
      {nodes.map((n) => {
        const hot = Date.now() - (pulses[n.id] ?? 0) < 4000;
        const color = DEPT_COLOR[n.dept];
        return (
          <div
            key={n.id}
            className="absolute z-20 w-10 -translate-x-1/2 -translate-y-1/2 text-center sm:w-[5.5rem]"
            style={{ left: `${n.left}%`, top: `${n.top}%` }}
          >
            <div
              className="mx-auto grid h-8 w-8 place-items-center rounded-full border bg-[var(--color-void)] sm:h-11 sm:w-11"
              style={{
                borderColor: color,
                color,
                boxShadow: hot ? `0 0 16px ${color}` : "none",
              }}
            >
              <AgentIcon name={n.icon} />
            </div>
            <div className="mt-1 hidden truncate text-[0.62rem] font-semibold leading-tight sm:block">{n.name}</div>
            <div className="hidden truncate text-[0.58rem] text-[var(--color-muted)] md:block">{n.role}</div>
          </div>
        );
      })}
    </div>
  );
}
