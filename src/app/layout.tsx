import "./globals.css";

export const metadata = {
  title: "NCE / Adam's Boring Field Guide",
  description: "NCE Classic v0.1 Admin Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
