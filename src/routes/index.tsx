import { createFileRoute } from "@tanstack/react-router";
import { GravityStage } from "@/components/gravity/GravityStage";
import { Decisions, EventStream, MarketPanel, ProbePanel, StatusPanel } from "@/components/gravity/Panels";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="grid gap-3 p-3 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:p-4">
      <div className="order-2 flex flex-col gap-3 lg:order-1">
        <StatusPanel />
        <MarketPanel />
        <div className="lg:mt-auto">
          <ProbePanel />
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <p className="label-kicker mb-2 text-center">
          Real-time desk network · live message flow · unsigned routes
        </p>
        <GravityStage />
        <p className="mt-2 text-center font-mono text-[0.65rem] tracking-[0.22em] text-[var(--color-muted)]">
          DIFFERENT DESKS. ONE TAPE. YOU SIGN.
        </p>
      </div>
      <div className="order-3 flex flex-col gap-3">
        <EventStream />
        <Decisions />
      </div>
    </main>
  );
}
