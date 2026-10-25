import { create } from "zustand";
import { runCycle } from "./engine";
import type { FirmEvent, LivePair, Mandate } from "./types";

type FirmState = {
  pairs: LivePair[];
  events: FirmEvent[];
  mandates: Mandate[];
  cycle: number;
  status: "connecting" | "online" | "degraded";
  error: string;
  selected: LivePair | null;
  score: number;
  veto: boolean;
  pulses: Record<string, number>;
  polling: boolean;
  poll: () => Promise<void>;
};

export const useFirm = create<FirmState>((set, get) => ({
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
      const data = (await res.json()) as { pairs?: LivePair[]; error?: string };
      const pairs = data.pairs ?? [];
      const cycle = get().cycle + 1;
      const result = runCycle(pairs, cycle);
      const pulses: Record<string, number> = { ...get().pulses };
      const now = Date.now();
      for (const e of result.events) {
        pulses[e.from] = now;
        pulses[e.to] = now;
      }
      const mandates = result.mandate
        ? [result.mandate, ...get().mandates].slice(0, 24)
        : get().mandates;
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
        polling: false,
      });
    } catch (err) {
      set({
        status: "degraded",
        error: err instanceof Error ? err.message : "Feed failed",
        polling: false,
      });
    }
  },
}));
