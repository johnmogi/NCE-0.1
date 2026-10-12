"use client";

export interface ProductNotice {
  id: string;
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
        <span>PRODUCT</span>
        <button type="button" onClick={onToggle}>{open ? "HIDE" : "SHOW"}</button>
      </div>
      {open && (
        <div className="nce-dock-log">
          {notices.length === 0 && <p>No product notices yet.</p>}
          {notices.map((notice) => (
            <p key={notice.id}><b>{notice.code}</b> {notice.detail}</p>
          ))}
        </div>
      )}
    </section>
  );
}
