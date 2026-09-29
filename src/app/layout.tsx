import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { WalletProvider } from "@/context/WalletContext";
import { JarsProvider } from "@/context/JarsContext";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "OpenJar — The Prospectus Ledger | SME IPO Fractionalization",
  description:
    "A private-bank prospectus crossed with an on-chain ledger. Democratizing high-ticket SME IPOs on the MST blockchain.",
  keywords: ["SME IPO", "MST Blockchain", "Fractionalization", "OpenJar", "Fintech", "DeFi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink text-paper min-h-screen antialiased bg-grid-texture selection:bg-cobalt/30 selection:text-white">
        <ToastProvider>
          <WalletProvider>
            <JarsProvider>
              <ToastContainer />
              {children}
            </JarsProvider>
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
