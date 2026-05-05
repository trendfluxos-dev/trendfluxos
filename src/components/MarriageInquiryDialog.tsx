import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Heart, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const COUNTRY_CODES = [
  { code: "+880", label: "🇧🇩 +880 Bangladesh" },
  { code: "+91", label: "🇮🇳 +91 India" },
  { code: "+1", label: "🇺🇸 +1 USA / Canada" },
  { code: "+44", label: "🇬🇧 +44 UK" },
  { code: "+971", label: "🇦🇪 +971 UAE" },
  { code: "+966", label: "🇸🇦 +966 Saudi Arabia" },
  { code: "+60", label: "🇲🇾 +60 Malaysia" },
  { code: "+65", label: "🇸🇬 +65 Singapore" },
  { code: "+61", label: "🇦🇺 +61 Australia" },
  { code: "+49", label: "🇩🇪 +49 Germany" },
  { code: "+33", label: "🇫🇷 +33 France" },
  { code: "+39", label: "🇮🇹 +39 Italy" },
  { code: "+90", label: "🇹🇷 +90 Turkey" },
  { code: "+92", label: "🇵🇰 +92 Pakistan" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  country_code: z.string().trim().regex(/^\+\d{1,4}$/, "Pick a country code"),
  whatsapp: z.string().trim().regex(/^\d{6,15}$/, "WhatsApp number must be 6–15 digits"),
});

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const MarriageInquiryDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      name,
      country_code: countryCode,
      whatsapp: whatsapp.replace(/\D/g, ""),
    });
    if (!parsed.success) {
      toast({
        title: "Please check your details",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("marriage_inquiries").insert(parsed.data);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Submission failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thank you 💍",
      description: "Opening the marriage profile for you…",
    });
    onOpenChange(false);
    navigate("/marriage");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-0 p-0 overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(160deg, #0a0a0a 0%, #1a0507 55%, #0a0a0a 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px -20px rgba(220,38,38,0.45)",
        }}
      >
        {/* Top accent bar — black / white / red */}
        <div className="h-1.5 w-full bg-gradient-to-r from-black via-white to-red-600" />

        <div className="px-6 pt-6 pb-7 text-white">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-red-600/60 bg-gradient-to-br from-red-600/30 to-black shadow-[0_0_30px_rgba(220,38,38,0.45)]">
              <Heart className="h-7 w-7 text-red-500 fill-red-500/30" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold tracking-tight text-white">
              A Sincere Introduction
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-white/70 mt-1">
              Share your details — we'll open the private marriage profile for
              your respectful consideration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-name" className="text-white/85">Your Name</Label>
              <Input
                id="m-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                maxLength={80}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-red-500/60 focus-visible:border-red-500/60"
              />
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-cc" className="text-white/85">Code</Label>
                <select
                  id="m-cc"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/60"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-black text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-wa" className="text-white/85">WhatsApp Number</Label>
                <Input
                  id="m-wa"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  placeholder="1XXXXXXXXX"
                  maxLength={15}
                  required
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-red-500/60 focus-visible:border-red-500/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative mt-2 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.7)] transition hover:brightness-110 disabled:opacity-70"
            >
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>Open Marriage Profile</>
              )}
            </button>

            <p className="text-center text-[11px] text-white/50">
              Your contact stays private — used only for respectful family
              follow-up.
            </p>
          </form>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-white to-black" />
      </DialogContent>
    </Dialog>
  );
};

export default MarriageInquiryDialog;
