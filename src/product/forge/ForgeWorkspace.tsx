"use client";

import { ForgeBoard } from "./ForgeBoard";
import { ForgeControls } from "./ForgeControls";
import { ForgeInspector } from "./ForgeInspector";
import { ForgeManifest } from "./ForgeManifest";
import { ForgeValidation } from "./ForgeValidation";

export function ForgeWorkspace() {
  return (
    <div className="forge">
      <ForgeControls />
      <ForgeBoard />
      <ForgeInspector />
      <ForgeValidation />
      <ForgeManifest />
    </div>
  );
}
