import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { WalletProvider } from "@/context/WalletContext";
import { IpoProvider } from "@/context/IpoContext";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "MST Open Jar | SME IPO Fractionalization Protocol",
  description: "Democratizing high-ticket SME IPO lots on the MST blockchain. Pool micro-tokens with non-custodial smart contracts and zero-bias allotment.",
  keywords: ["SME IPO", "MST Blockchain", "Fractionalization", "Bridgekey", "Web3 FinTech", "Open Jar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070A11] text-slate-100 min-h-screen selection:bg-brand-cyan/30 selection:text-white antialiased">
        <ToastProvider>
          <WalletProvider>
            <IpoProvider>
              <ToastContainer />
              {children}
            </IpoProvider>
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
