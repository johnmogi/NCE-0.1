export const surfaces = [
  { id: "codex", label: "CODEX", status: "ACTIVE" },
  { id: "forge", label: "FORGE", status: "ACTIVE" },
  { id: "play", label: "PLAY", status: "PROTOTYPE A" },
] as const;

export type SurfaceId = (typeof surfaces)[number]["id"];
