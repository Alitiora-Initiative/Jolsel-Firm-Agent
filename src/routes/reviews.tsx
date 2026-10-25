import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DEV_WALLET, isDevWallet } from "@/lib/chain/protocol";
import { useWallet } from "@/lib/chain/wallet";

export const Route = createFileRoute("/reviews")({ component: ReviewsPage });

const HARMFUL = /private key|seed phrase|drain|exploit|steal wallet|backdoor|phish/i;

type Verdict = { ok: boolean; lines: string[] };

function review(text: string): Verdict {
  const lines: string[] = [];
  const trimmed = text.trim();
  if (trimmed.length < 20) {
    lines.push("Review clerk: too short to act on. Not filed.");
    return { ok: false, lines };
  }
  if (HARMFUL.test(trimmed)) {
    lines.push("Cybersecurity: this asks for a breach or a secret. Turned down. Not filed.");
    return { ok: false, lines };
  }
  lines.push("Website manager: readable and not empty.");
  lines.push("Cybersecurity: no drain, seed, or exploit request detected in the text.");
  lines.push("Fullstack engineer: queued as a product note, not an automatic code change.");
  lines.push("On-chain engineer: no funds move from a review.");
  lines.push(`Review clerk: filing to GitHub so ${DEV_WALLET} can read it. The five desks do not pretend to have voted on-chain.`);
  return { ok: true, lines };
}

function ReviewsPage() {
  const address = useWallet((s) => s.address);
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const submit = () => {
    const next = review(text);
    setVerdict(next);
    if (!next.ok) return;
    const title = text.trim().slice(0, 72);
    const body = `${text.trim()}\n\nFiled from the Jolsel reviews page.`;
    const url = `https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="label-kicker">Reviews</p>
      <h1 className="mt-2 text-4xl font-semibold">Tell the technical team</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        A note is checked in the browser, then GitHub opens so you file it yourself. This site has
        no private database, so it will not claim a review was stored if GitHub did not take it.
        {isDevWallet(address) ? " You are on the dev wallet. Read the repo issues for the inbox." : ""}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="What should change, what broke, or what you want the desks to consider."
        className="mt-5 w-full rounded-xl border border-[var(--color-line)] bg-transparent p-3 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        className="mt-3 rounded-full bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-[var(--color-void)]"
      >
        Run the review
      </button>
      {verdict && (
        <ul className="mt-4 space-y-2 text-sm">
          {verdict.lines.map((line) => (
            <li key={line} className="hud px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
      )}
      {isDevWallet(address) && (
        <a
          className="mt-6 inline-block text-sm text-[var(--color-cyan)]"
          href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent/issues"
          target="_blank"
          rel="noreferrer"
        >
          Open the dev inbox on GitHub
        </a>
      )}
    </main>
  );
}
