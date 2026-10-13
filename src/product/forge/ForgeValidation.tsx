"use client";

import { catalog } from "@/content/catalog";
import { getValidationSummary } from "@/admin/diagnostics";
import { exportableRun } from "@/engine/generate";
import { validateRun } from "@/engine/validate";
import { useState } from "react";
import { useWorld } from "@/product/session/WorldContext";

export function ForgeValidation() {
  const world = useWorld();
  const [copyNote, setCopyNote] = useState("");
  if (!world.run) return null;
  const checks = getValidationSummary(world.run, catalog);
  const failures = validateRun(world.run, catalog);
  const json = () => JSON.stringify(exportableRun(world.run!), null, 2);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json());
      setCopyNote("Copied");
    } catch {
      setCopyNote("Copy failed");
    }
  };
  const download = () => {
    const blob = new Blob([json()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${world.run!.runId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="forge-validation" aria-label="Validation">
      <p className="codex-kicker">Validation</p>
      <ul>
        {checks.map((check) => (
          <li key={check.label} className={check.pass ? "is-pass" : "is-fail"}>
            {check.pass ? "✓" : "×"} {check.label}
          </li>
        ))}
      </ul>
      {failures.length > 0 && <p className="forge-error">{failures.join("; ")}</p>}
      <div className="forge-export">
        <button type="button" onClick={copy}>Copy run JSON</button>
        <button type="button" onClick={download}>Export run JSON</button>
        {copyNote && <span>{copyNote}</span>}
      </div>
    </section>
  );
}
