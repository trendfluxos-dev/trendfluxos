import { Link } from "react-router-dom";
import { FileText, ArrowUpRight } from "lucide-react";

const PORTFOLIO_PATH = "/portfolio";

const trackResumeEvent = (label: string) => {
  const payload = { event: "resume_cv_click", label, href: PORTFOLIO_PATH, ts: Date.now() };
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(payload);
  } catch { /* ignore */ }
  console.info("[analytics]", payload);
};

export const ResumeButton = () => {
  return (
    <Link
      to={PORTFOLIO_PATH}
      onClick={() => trackResumeEvent("open_portfolio")}
      aria-label="Open the executive portfolio of Zahid Hasan Emon — AI-Powered Growth Operator"
      className="absolute top-3 right-3 sm:top-auto sm:bottom-5 sm:right-5 z-20 inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white shadow-[0_8px_20px_-10px_rgba(220,38,38,0.55)] transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
      Resume / CV
      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
    </Link>
  );
};

export default ResumeButton;
