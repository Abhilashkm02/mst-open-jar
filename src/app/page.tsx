"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ExploreView } from "@/components/ExploreView";
import { MyJarsView } from "@/components/MyJarsView";
import { AllotmentStatusView } from "@/components/AllotmentStatusView";
import { InvestDrawer } from "@/components/InvestDrawer";
import { IssuerConsoleModal } from "@/components/IssuerConsoleModal";
import { useJars } from "@/context/JarsContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"explore" | "my-jars" | "allotment">("explore");
  const [isIssuerConsoleOpen, setIsIssuerConsoleOpen] = useState(false);
  const { selectedJar, closeInvestDrawer } = useJars();

  return (
    <div className="min-h-screen flex flex-col bg-ink text-paper pb-16 md:pb-0">
      {/* 64px Sticky Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIssuerConsole={() => setIsIssuerConsoleOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === "explore" && <ExploreView />}
        {activeTab === "my-jars" && <MyJarsView onNavigateToAllotment={() => setActiveTab("allotment")} />}
        {activeTab === "allotment" && (
          <AllotmentStatusView onOpenIssuerConsole={() => setIsIssuerConsoleOpen(true)} />
        )}
      </main>

      {/* Right-Side Desktop Drawer / Full-Screen Mobile Sheet */}
      <InvestDrawer jar={selectedJar} onClose={closeInvestDrawer} />

      {/* Issuer & Clearing Console Modal */}
      <IssuerConsoleModal
        isOpen={isIssuerConsoleOpen}
        onClose={() => setIsIssuerConsoleOpen(false)}
      />
    </div>
  );
}
