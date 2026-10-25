import { useWallet } from "@/lib/chain/wallet";
import { isDevWallet } from "@/lib/chain/protocol";

export function shortAddr(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectButton() {
  const address = useWallet((s) => s.address);
  const name = useWallet((s) => s.name);
  const connecting = useWallet((s) => s.connecting);
  const error = useWallet((s) => s.error);
  const connect = useWallet((s) => s.connect);
  const disconnect = useWallet((s) => s.disconnect);
  const dev = isDevWallet(address);

  return (
    <div className="flex flex-col items-end">
      {address ? (
        <button
          type="button"
          onClick={() => void disconnect()}
          className="rounded-full border border-[var(--color-line)] px-3 py-1.5 font-mono text-xs"
          style={{ color: dev ? "var(--color-amber)" : "var(--color-cyan)" }}
        >
          {dev ? "DEV " : ""}
          {name ? `${name} ` : ""}
          {shortAddr(address)}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void connect()}
          disabled={connecting}
          className="rounded-full bg-[var(--color-cyan)] px-3 py-1.5 text-sm font-semibold text-[var(--color-void)] disabled:opacity-60"
        >
          {connecting ? "Connecting…" : "Connect wallet"}
        </button>
      )}
      {error && <span className="mt-1 max-w-48 text-right text-[0.65rem] text-[var(--color-rose)]">{error}</span>}
    </div>
  );
}
