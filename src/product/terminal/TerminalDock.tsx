"use client";

export type NoticeKind = "product" | "generation" | "runtime";

export interface ProductNotice {
  id: string;
  kind: NoticeKind;
  code: string;
  detail: string;
}

export function TerminalDock({
  notices,
  open,
  onToggle,
}: {
  notices: ProductNotice[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="nce-dock" aria-label="Terminal">
      <div className="nce-dock-bar">
        <strong>TERMINAL</strong>
        <button type="button" onClick={onToggle}>{open ? "HIDE" : "SHOW"}</button>
      </div>
      {open && (
        <div className="nce-dock-log">
          {notices.length === 0 && <p>No events yet.</p>}
          {notices.map((notice) => (
            <p key={notice.id}><i>{notice.kind}</i><b>{notice.code}</b> {notice.detail}</p>
          ))}
        </div>
      )}
    </section>
  );
}
