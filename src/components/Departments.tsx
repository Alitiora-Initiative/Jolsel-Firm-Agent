const departments = [
  { id: "discovery", name: "Discovery", color: "from-cyan-500 to-blue-500", agents: [ { name: "Bscoter", role: "Token scout & liquidity radar" }, { name: "Analuszer", role: "Precision metrics & custom indicators" }, { name: "CryptoGuru", role: "Crowd velocity & social sentiment" } ] },
  { id: "planning", name: "Planning", color: "from-violet-500 to-purple-500", agents: [ { name: "Forecaster", role: "Scenario simulation & worth-it score" }, { name: "LongTermPlanner", role: "Asset-class router by equity size" }, { name: "ShortTermPlanner", role: "Pyramiding & micro-high triggers" } ] },
  { id: "compliance", name: "Compliance", color: "from-amber-500 to-orange-500", agents: [ { name: "Overthinker", role: "Tail-risk & black-swan simulation" }, { name: "Reviewer", role: "Contract safety & audit checks" }, { name: "MrGrumpy", role: "Zero-tolerance policy enforcer" }, { name: "RiskManager", role: "Survival floor & position sizing" } ] },
  { id: "executive", name: "Executive", color: "from-emerald-500 to-green-500", agents: [ { name: "Broker", role: "Momentum advocacy in boardroom" }, { name: "Judge", role: "Vote aggregation & quorum" }, { name: "Verdicter", role: "Mandate signing & approval" }, { name: "Trader", role: "Atomic Solana execution (Jupiter)" } ] },
  { id: "audit", name: "Audit", color: "from-rose-500 to-pink-500", agents: [ { name: "RecordKeeper", role: "Heartbeat & trade ledger" }, { name: "RecordReviewer", role: "Performance evaluation" }, { name: "Teacher", role: "Daily audit quizzes & lessons" } ] },
];

export function Departments() {
  return (
    <section id="departments" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Five Departments · 17 Agents</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Each agent has a single clear responsibility. Together they form a complete trading firm that never sleeps.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur transition hover:border-white/20 hover:bg-slate-900/80">
              <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${dept.color} px-3 py-1 text-xs font-semibold text-white`}>{dept.name}</div>
              <ul className="space-y-3">
                {dept.agents.map((agent) => (
                  <li key={agent.name} className="flex flex-col">
                    <span className="font-mono text-sm font-medium text-white">{agent.name}</span>
                    <span className="text-xs text-slate-400">{agent.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
