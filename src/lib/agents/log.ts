import type { AgentEvent, AgentLevel, CorporateContext } from "./context";

export function logAgent(
  ctx: CorporateContext,
  agent: string,
  message: string,
  level: AgentLevel = "info"
): AgentEvent {
  const event: AgentEvent = {
    id: `${ctx.runId}-${ctx.events.length}-${agent}`,
    at: Date.now(),
    agent,
    message,
    level,
  };
  ctx.events.push(event);
  return event;
}
