import "./globals.css";
import "../product/nce.css";

export const metadata = {
  title: "NCE",
  description: "NCE. Codex is the current product surface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
