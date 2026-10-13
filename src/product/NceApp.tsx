"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { CodexWorkspace } from "./codex/CodexWorkspace";
import { ForgeWorkspace } from "./forge/ForgeWorkspace";
import type { SurfaceId } from "./navigation";
import { WorldProvider } from "./session/WorldContext";
import type { NoticeKind, ProductNotice } from "./terminal/TerminalDock";

export function NceApp() {
  const [surface, setSurface] = useState<SurfaceId>("codex");
  const [notices, setNotices] = useState<ProductNotice[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const sequence = useRef(0);
  const notify = useCallback((kind: NoticeKind, code: string, detail: string) => {
    sequence.current += 1;
    const id = `n-${sequence.current}`;
    setNotices((current) => [...current.slice(-79), { id, kind, code, detail }]);
  }, []);
  const productNotice = useCallback((code: string, detail: string) => notify("product", code, detail), [notify]);

  return (
    <WorldProvider notify={notify} onSurface={setSurface}>
      <AppShell
        surface={surface}
        notices={notices}
        terminalOpen={terminalOpen}
        onSurface={setSurface}
        onToggleTerminal={() => setTerminalOpen((open) => !open)}
      >
        {surface === "codex" && <CodexWorkspace onNotice={productNotice} />}
        {surface === "forge" && <ForgeWorkspace />}
        {surface === "play" && (
          <section className="nce-pending">
            <p className="codex-kicker">Play</p>
            <h1>Prototype A</h1>
            <p>The playable prototype remains in src/legacy/prototype-a. It is not mounted as this product.</p>
          </section>
        )}
      </AppShell>
    </WorldProvider>
  );
}
