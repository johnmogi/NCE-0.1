"use client";

import { useCallback, useState } from "react";
import { AppShell } from "./AppShell";
import { CodexWorkspace } from "./codex/CodexWorkspace";
import type { SurfaceId } from "./navigation";
import type { ProductNotice } from "./terminal/TerminalDock";

export function NceApp() {
  const [surface, setSurface] = useState<SurfaceId>("codex");
  const [notices, setNotices] = useState<ProductNotice[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const notice = useCallback((code: string, detail: string) => {
    setNotices((current) => [...current.slice(-39), { id: `${code}-${current.length + 1}`, code, detail }]);
  }, []);

  return (
    <AppShell
      surface={surface}
      notices={notices}
      terminalOpen={terminalOpen}
      onSurface={setSurface}
      onToggleTerminal={() => setTerminalOpen((open) => !open)}
    >
      {surface === "codex" && <CodexWorkspace onNotice={notice} />}
      {surface === "forge" && (
        <section className="nce-pending">
          <p className="codex-kicker">Forge</p>
          <h1>Not yet built</h1>
          <p>World generation still lives in the engine. This surface is not a Forge.</p>
        </section>
      )}
      {surface === "play" && (
        <section className="nce-pending">
          <p className="codex-kicker">Play</p>
          <h1>Prototype A</h1>
          <p>The playable prototype remains in src/legacy/prototype-a. It is not mounted as this product.</p>
        </section>
      )}
    </AppShell>
  );
}
