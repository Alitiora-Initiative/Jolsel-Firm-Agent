const steps = [
  { n: "01", title: "Discovery", desc: "Bscoter scouts, CryptoGuru measures crowd, Analuszer scores indicators (≥80 gate)." },
  { n: "02", title: "Planning", desc: "Forecaster runs scenario matrix, LongTermPlanner routes asset class, ShortTermPlanner sets pyramiding." },
  { n: "03", title: "Compliance", desc: "Overthinker, Reviewer, MrGrumpy & RiskManager can veto any trade." },
  { n: "04", title: "Executive", desc: "Broker advocates, Judge aggregates votes, Verdicter signs, Trader executes on Solana." },
  { n: "05", title: "Audit", desc: "RecordKeeper logs, RecordReviewer grades, Teacher runs daily lessons." },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="px-6 py-24 bg-slate-950/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Continuous Pipeline</h2>
          <p className="mt-4 text-slate-400">5-second heartbeat loop with adaptive back-off on failures.</p>
        </div>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.n} className="flex items-start gap-6 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-solana-green bg-slate-950 text-solana-green font-bold glow">{step.n}</div>
              <div>
                <div className="text-xl font-semibold text-white">{step.title}</div>
                <p className="mt-2 text-slate-400 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
