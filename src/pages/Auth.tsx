import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";
import trendfluxLogo from "@/assets/trendflux-logo.webp";

/**
 * Map raw auth errors to friendly, bilingual messages so we never leak
 * provider-specific strings (e.g. "AuthApiError: Invalid login credentials").
 */
function friendlyAuthError(message: string, mode: "signin" | "signup"): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "ভুল email বা password। আবার চেষ্টা করুন।";
  }
  if (m.includes("email not confirmed")) {
    return "প্রথমে আপনার email confirm করুন, তারপর sign in করুন।";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "এই email দিয়ে আগে account তৈরি হয়েছে। Sign in করুন।";
  }
  if (m.includes("password") && m.includes("6")) {
    return "Password কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network সমস্যা। Internet connection check করে আবার চেষ্টা করুন।";
  }
  return mode === "signin" ? "Sign in করা যায়নি। আবার চেষ্টা করুন।" : "Account তৈরি করা যায়নি। আবার চেষ্টা করুন।";
}

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  useSeo({
    title: "Sign In — TrendFlux Ecosystem",
    description: "Sign in to access TrendFlux Ecosystem admin tools.",
    noindex: true,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.scrollTo({ top: 0, behavior: "auto" });
        navigate(redirect, { replace: true });
      }
    });
  }, [navigate, redirect]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    // Light client-side guardrails before hitting the network.
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("একটি valid email address দিন।");
      return;
    }
    if (password.length < 6) {
      toast.error("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (mode === "signup" && fullName.trim().length < 2) {
      toast.error("আপনার পুরো নাম লিখুন।");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirect}`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account তৈরি হয়েছে। এখন sign in করুন।");
          setMode("signin");
          return;
        }
        toast.success("স্বাগতম!");
      }
      window.scrollTo({ top: 0, behavior: "auto" });
      navigate(redirect, { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      console.error("Auth submit failed", err);
      toast.error(friendlyAuthError(raw, mode));
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5">
            <img
              src={trendfluxLogo}
              alt="TrendFlux Digital"
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              TrendFlux <span className="text-foreground/55 font-normal">Digital</span>
            </span>
          </div>
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground/45">
            AI Systems · Digital Growth
          </p>
        </div>

        <form
          onSubmit={handle}
          className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 sm:p-8 space-y-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-30px_rgba(0,0,0,0.25)]"
        >
          <div className="space-y-1.5">
            <h1 className="font-display text-[22px] font-semibold tracking-tight">
              {isSignup ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-[13px] leading-relaxed text-foreground/60">
              {isSignup
                ? "TrendFlux Academy, AI Systems ও Professional Toolkit Access।"
                : "TrendFlux Ecosystem-এ ফিরে স্বাগতম।"}
            </p>
          </div>

          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-[12px] font-medium text-foreground/75">Full name</Label>
              <Input
                id="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-medium text-foreground/75">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[12px] font-medium text-foreground/75">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[14px] focus-visible:ring-2 focus-visible:ring-[#B11226]/30 focus-visible:border-[#B11226]/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-[14px] font-semibold text-white tracking-tight transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_-10px_rgba(177,18,38,0.55)]"
            style={{ background: "linear-gradient(135deg,#B11226 0%,#7A0C19 100%)" }}
          >
            {loading ? "..." : isSignup ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="block w-full text-center text-[12.5px] text-foreground/55 hover:text-foreground transition-colors"
          >
            {isSignup ? (
              <>Already have access? <span className="text-foreground/85 font-medium">Sign in</span></>
            ) : (
              <>Need access? <span className="text-foreground/85 font-medium">Create account</span></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-foreground/45">
          Built for creators, operators & ambitious digital professionals.
        </p>
      </div>
    </div>
  );
}
