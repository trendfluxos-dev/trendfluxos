import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Wrapper for every /edtech/* route. Inherits TrendFlux navbar/footer so the
 * কর্মশিক্ষা TED Plus surface stays inside the same shell and design language.
 */
const EdtechShell = ({ children }: { children: ReactNode }) => (
  <div
    data-brand="edtech"
    className="min-h-dvh bg-background text-foreground font-sans antialiased"
  >
    <Navbar />
    {children}
    <Footer />
  </div>
);

export default EdtechShell;