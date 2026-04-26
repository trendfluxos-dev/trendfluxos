import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = [
  { label: "Growth Service", options: ["AI Automation", "Paid Media", "Funnels", "Branding"] },
  { label: "Industry Sector", options: ["Education", "Retail", "SaaS", "Personal Brand"] },
  { label: "Tech Stack", options: ["Meta Ads", "GoHighLevel", "WhatsApp", "CRM"] },
  { label: "Business Stage", options: ["Startup", "Growth", "Scale", "Enterprise"] },
];

const FilterBar = () => {
  return (
    <div className="sticky top-20 z-30 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto glass-strong rounded-2xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {filters.map((f) => (
            <select
              key={f.label}
              defaultValue=""
              className="bg-background/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all hover:border-primary/40"
            >
              <option value="" disabled>
                {f.label}
              </option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          <Button variant="gold" className="rounded-xl">
            <Search className="w-4 h-4" />
            Search Operations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
