"use client";

import type { ReactNode } from "react";
import { surfaces, type SurfaceId } from "./navigation";
import { TerminalDock, type ProductNotice } from "./terminal/TerminalDock";

export function AppShell({
  surface,
  notices,
  terminalOpen,
  onSurface,
  onToggleTerminal,
  children,
}: {
  surface: SurfaceId;
  notices: ProductNotice[];
  terminalOpen: boolean;
  onSurface: (surface: SurfaceId) => void;
  onToggleTerminal: () => void;
  children: ReactNode;
}) {
  return (
    <div className="nce">
      <header className="nce-top">
        <p className="nce-brand">NCE</p>
        <nav aria-label="NCE surfaces">
          {surfaces.map((item) => (
            <button
              key={item.id}
              type="button"
              className={surface === item.id ? "is-on" : ""}
              onClick={() => onSurface(item.id)}
            >
              {item.label}
              <small>{item.status}</small>
            </button>
          ))}
        </nav>
      </header>
      <main className="nce-stage">{children}</main>
      <TerminalDock notices={notices} open={terminalOpen} onToggle={onToggleTerminal} />
    </div>
  );
}
