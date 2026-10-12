import "./globals.css";

export const metadata = {
  title: "NCE",
  description: "NCE product shell. Play, Forge, and Codex.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
